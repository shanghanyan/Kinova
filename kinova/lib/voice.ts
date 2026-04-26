interface VoiceConfig {
  rate: number;
  pitch: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GenerateReplyOptions {
  sessionId?: string;
  systemPrompt?: string;
  maxHistoryMessages?: number;
}

const DEFAULT_CONFIG: VoiceConfig = {
  rate: 1.12,   // faster = more upbeat
  pitch: 0.92   // slightly lower = more masculine
};

const queue: string[] = [];
let active = false;
let voiceUnlocked = false;
const lastSpoken: Record<string, number> = {};
const MEMORY_KEY_PREFIX = "kinova.chat.memory.";
const MAX_DIAGNOSTIC_EVENTS = 120;

type VoiceDiagnosticEventType =
  | "runtime_check"
  | "unlock_called"
  | "unlock_warmup_started"
  | "unlock_warmup_error"
  | "queued"
  | "queue_skipped_empty"
  | "queue_draining_started"
  | "drain_idle"
  | "speak_called"
  | "speak_dispatched"
  | "speak_state_after_dispatch"
  | "utterance_start"
  | "utterance_end"
  | "utterance_error"
  | "interrupt_cancel"
  | "voices_changed"
  | "api_reply_raw"
  | "api_reply_cleaned";

export interface VoiceDiagnosticEvent {
  at: number;
  type: VoiceDiagnosticEventType;
  detail: string;
}

export interface VoiceDiagnosticsSnapshot {
  supported: boolean;
  unlocked: boolean;
  queueLength: number;
  active: boolean;
  voicesCount: number;
  selectedVoiceName: string | null;
  paused: boolean;
  pending: boolean;
  speaking: boolean;
  events: VoiceDiagnosticEvent[];
}

const diagnosticEvents: VoiceDiagnosticEvent[] = [];
const diagnosticListeners = new Set<() => void>();
let lastSelectedVoiceName: string | null = null;

function emitDiagnosticsChange() {
  diagnosticListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Best effort diagnostics updates only.
    }
  });
}

function pushDiagnostic(type: VoiceDiagnosticEventType, detail: string) {
  const event: VoiceDiagnosticEvent = {
    at: Date.now(),
    type,
    detail,
  };
  diagnosticEvents.push(event);
  if (diagnosticEvents.length > MAX_DIAGNOSTIC_EVENTS) {
    diagnosticEvents.splice(0, diagnosticEvents.length - MAX_DIAGNOSTIC_EVENTS);
  }
  if (typeof window !== "undefined") {
    console.info(`[voice:${type}] ${detail}`);
  }
  emitDiagnosticsChange();
}

function squashMetaReasoning(text: string): string {
  const postThink = text.includes("</think>") ? text.split("</think>").pop() ?? text : text;
  const t = postThink.trim();
  const metaPattern =
    /we need to|the user just said|instruction says|as a rule|thus output|hence final answer/i;
  if (!metaPattern.test(t)) return t;

  const finalSplit = t.split(/final answer:|hence final answer:|thus output\.?/i);
  const candidate = finalSplit[finalSplit.length - 1]?.trim() || t;
  const sentences = candidate.match(/[^.!?]+[.!?]+/g) ?? [candidate];
  return sentences.slice(-2).join(" ").trim();
}

function ensureOnlyFinalOutput(text: string): string {
  const cleaned = squashMetaReasoning(text).trim();
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(analysis|reasoning|thought process|plan):/i.test(line));
  const joined = lines.join(" ").trim();
  const sentences = joined.match(/[^.!?]+[.!?]+/g) ?? [joined];
  return sentences.slice(0, 2).join(" ").trim();
}

function cleanMarkdown(text: string): string {
  const noThink = text
    .replace(/<think>[\s\S]*?<\/think>/gi, " ")
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, " ")
    .replace(/<\/?think>/gi, " ")
    .replace(/<\/?analysis>/gi, " ");

  return noThink
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

function getSynthStateString(synth: SpeechSynthesis): string {
  return `paused=${synth.paused} pending=${synth.pending} speaking=${synth.speaking}`;
}

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices.length) return null;

  const selected =
    voices.find(v => v.name === "Google UK English Male") ||
    voices.find(v => v.name === "Google US English") ||
    voices.find(v => v.name === "Google UK English Female") ||
    voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
    voices.find(v => v.localService === false && v.lang.startsWith("en")) ||
    voices[0];

  lastSelectedVoiceName = selected?.name ?? null;
  return selected;
}

function drain(config: VoiceConfig): void {
  if (typeof window === "undefined") return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  if (!queue.length) {
    pushDiagnostic("drain_idle", "queue empty, drain stopped");
    active = false;
    return;
  }

  pushDiagnostic("queue_draining_started", `queueLength=${queue.length}`);
  active = true;
  const text = queue.shift();
  if (!text) {
    active = false;
    return;
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let idx = 0;

  const speakNext = () => {
    if (idx >= sentences.length) {
      drain(config);
      return;
    }

    const u = new SpeechSynthesisUtterance(sentences[idx].trim());
    let finished = false;
    const watchdogMs = 6000;
    const done = () => {
      if (finished) return;
      finished = true;
      idx += 1;
      speakNext();
    };
    const watchdog = window.setTimeout(done, watchdogMs);

    u.rate = config.rate;
    u.pitch = config.pitch;
    u.volume = 1.0;

    const voice = pickVoice(synth);
    if (voice) u.voice = voice;

    u.onend = () => {
      pushDiagnostic("utterance_end", `voice=${u.voice?.name ?? "default"} len=${u.text.length}`);
      window.clearTimeout(watchdog);
      done();
    };

    u.onerror = (event) => {
      const errorDetail =
        typeof event === "object" && event && "error" in event
          ? String((event as SpeechSynthesisErrorEvent).error)
          : "unknown";
      pushDiagnostic("utterance_error", `voice=${u.voice?.name ?? "default"} error=${errorDetail}`);
      window.clearTimeout(watchdog);
      done();
    };

    u.onstart = () => {
      pushDiagnostic("utterance_start", `voice=${u.voice?.name ?? "default"} len=${u.text.length}`);
    };

    if (synth.paused) synth.resume();
    pushDiagnostic(
      "speak_dispatched",
      `len=${u.text.length} voice=${u.voice?.name ?? "default"} ${getSynthStateString(synth)}`,
    );
    synth.speak(u);
    pushDiagnostic("speak_state_after_dispatch", getSynthStateString(synth));
  };

  const trySpeak = () => {
    const voices = synth.getVoices();
      if (voices.length > 0) {
        speakNext();
      } else {
        synth.onvoiceschanged = () => {
          synth.onvoiceschanged = null;
          speakNext();
        };
    }
  };
  trySpeak();
}

export function speak(text: string, interrupt = false, config: VoiceConfig = DEFAULT_CONFIG) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  const clean = cleanMarkdown(text);
  if (!clean) return;

  if (interrupt) {
    pushDiagnostic("interrupt_cancel", `cancel requested queueLengthBefore=${queue.length}`);
    synth.cancel();
    queue.length = 0;
    active = false;   // ← was missing before, cancel() doesn't reset this
  }

  queue.push(clean);
  pushDiagnostic("queued", `len=${clean.length} queueLength=${queue.length}`);
  if (!voiceUnlocked) return;
  if (!active) drain(config);
}

export function unlockVoice() {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) {
    pushDiagnostic("runtime_check", "unlock attempted but speechSynthesis missing");
    return;
  }

  voiceUnlocked = true;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    }
  } catch {
    pushDiagnostic("unlock_warmup_error", "AudioContext unlock failed");
  }

  try {
    synth.cancel();
    const warmup = new SpeechSynthesisUtterance(" ");
    warmup.volume = 0;
    warmup.onend = () => {
      if (!active && queue.length) drain(DEFAULT_CONFIG);
    };
    synth.speak(warmup);
  } catch {
    pushDiagnostic("unlock_warmup_error", "warmup utterance failed");
  }

  pushDiagnostic("unlock_called", `voices=${synth.getVoices().length}`);
  if (!active && queue.length) drain(DEFAULT_CONFIG);
}

export function speakDebounced(
  text: string,
  debounceMs = 4000,
  config: VoiceConfig = DEFAULT_CONFIG
) {
  const clean = cleanMarkdown(text);
  const now = Date.now();

  if (lastSpoken[clean] && now - lastSpoken[clean] < debounceMs) return;

  lastSpoken[clean] = now;
  speak(clean, false, config);
}

export function cancelSpeech() {
  if (typeof window === "undefined") return;

  window.speechSynthesis.cancel();
  queue.length = 0;
  active = false;
}

export function getVoiceDiagnosticsSnapshot(): VoiceDiagnosticsSnapshot {
  if (typeof window === "undefined") {
    return {
      supported: false,
      unlocked: voiceUnlocked,
      queueLength: queue.length,
      active,
      voicesCount: 0,
      selectedVoiceName: lastSelectedVoiceName,
      paused: false,
      pending: false,
      speaking: false,
      events: [...diagnosticEvents],
    };
  }
  const synth = window.speechSynthesis;
  return {
    supported: Boolean(synth),
    unlocked: voiceUnlocked,
    queueLength: queue.length,
    active,
    voicesCount: synth?.getVoices().length ?? 0,
    selectedVoiceName: lastSelectedVoiceName,
    paused: synth?.paused ?? false,
    pending: synth?.pending ?? false,
    speaking: synth?.speaking ?? false,
    events: [...diagnosticEvents],
  };
}

export function subscribeVoiceDiagnostics(listener: () => void): () => void {
  diagnosticListeners.add(listener);
  return () => {
    diagnosticListeners.delete(listener);
  };
}

function getMemoryKey(sessionId: string) {
  return `${MEMORY_KEY_PREFIX}${sessionId}`;
}

export function loadConversationMemory(sessionId = "default"): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getMemoryKey(sessionId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) =>
        m &&
        (m.role === "system" || m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    );
  } catch {
    return [];
  }
}

export function saveConversationMemory(messages: ChatMessage[], sessionId = "default") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getMemoryKey(sessionId), JSON.stringify(messages));
}

export function clearConversationMemory(sessionId = "default") {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getMemoryKey(sessionId));
}

export async function generateCoachReply(
  userText: string,
  options: GenerateReplyOptions = {},
): Promise<{ reply: string; messages: ChatMessage[] }> {
  const {
    sessionId = "default",
    systemPrompt = "You are Kinova's fitness companion. Be concise, motivating, and actionable.",
    maxHistoryMessages = 16,
  } = options;

  const userContent = cleanMarkdown(userText);
  if (!userContent) {
    return { reply: "", messages: loadConversationMemory(sessionId) };
  }

  const history = loadConversationMemory(sessionId);
  const limitedHistory = history.slice(-maxHistoryMessages);
  const messages: ChatMessage[] = [{ role: "system", content: systemPrompt }, ...limitedHistory, { role: "user", content: userContent }];

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "MBZUAI-IFM/K2-Think-v2",
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const data = (await res.json()) as { reply?: string };
  const rawReply = data.reply ?? "";
  pushDiagnostic("api_reply_raw", `len=${rawReply.length}`);
  const reply = cleanMarkdown(ensureOnlyFinalOutput(rawReply));
  pushDiagnostic("api_reply_cleaned", `len=${reply.length}`);
  const nextMessages: ChatMessage[] = [
    ...limitedHistory,
    { role: "user", content: userContent },
    { role: "assistant", content: reply },
  ];
  saveConversationMemory(nextMessages, sessionId);

  return { reply, messages: nextMessages };
}

export async function generateAndSpeakCoachReply(
  userText: string,
  options: GenerateReplyOptions = {},
): Promise<{ reply: string; messages: ChatMessage[] }> {
  const result = await generateCoachReply(userText, options);
  if (result.reply) {
    speak(result.reply, true);
  }
  return result;
}