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
  interrupt?: boolean;
}

const DEFAULT_CONFIG: VoiceConfig = {
  rate: 1.12,   // faster = more upbeat
  pitch: 0.92   // slightly lower = more masculine
};

const queue: string[] = [];
let active = false;
let voiceUnlocked = false;
let playbackToken = 0;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
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

async function requestPiperAudio(text: string): Promise<Blob> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`Piper TTS failed: ${res.status} ${details}`);
  }
  return res.blob();
}

function stopCurrentAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch {
      // best effort
    }
    currentAudio = null;
  }
  if (currentAudioUrl) {
    try {
      URL.revokeObjectURL(currentAudioUrl);
    } catch {
      // best effort
    }
    currentAudioUrl = null;
  }
}

function playPiperBlob(blob: Blob, text: string, token: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    currentAudioUrl = url;
    lastSelectedVoiceName = "piper-local";

    const cleanup = () => {
      if (currentAudioUrl === url) {
        URL.revokeObjectURL(url);
        currentAudioUrl = null;
      }
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };

    audio.onended = () => {
      cleanup();
      pushDiagnostic("utterance_end", `voice=piper-local len=${text.length}`);
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      pushDiagnostic("utterance_error", "voice=piper-local error=audio_playback_failed");
      reject(new Error("Audio playback failed"));
    };

    if (token !== playbackToken) {
      cleanup();
      resolve();
      return;
    }

    audio.play().then(() => {
      pushDiagnostic("utterance_start", `voice=piper-local len=${text.length}`);
    }).catch((err) => {
      cleanup();
      pushDiagnostic("utterance_error", `voice=piper-local error=${String(err)}`);
      reject(err);
    });
  });
}

function drain(config: VoiceConfig): void {
  if (typeof window === "undefined") return;

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
  const token = playbackToken;

  const speakNext = () => {
    if (token !== playbackToken) {
      active = false;
      return;
    }
    if (idx >= sentences.length) {
      drain(config);
      return;
    }

    const sentence = sentences[idx].trim();
    pushDiagnostic(
      "speak_dispatched",
      `len=${sentence.length} voice=piper-local rate=${config.rate} pitch=${config.pitch}`,
    );
    void requestPiperAudio(sentence)
      .then((blob) => playPiperBlob(blob, sentence, token))
      .catch((err) => {
        pushDiagnostic("utterance_error", `voice=piper-local error=${String(err)}`);
      })
      .finally(() => {
        if (token !== playbackToken) return;
        idx += 1;
        speakNext();
      });
  };
  speakNext();
}

export function speak(text: string, interrupt = false, config: VoiceConfig = DEFAULT_CONFIG) {
  if (typeof window === "undefined") return;

  const clean = cleanMarkdown(text);
  if (!clean) return;

  if (interrupt) {
    pushDiagnostic("interrupt_cancel", `cancel requested queueLengthBefore=${queue.length}`);
    playbackToken += 1;
    stopCurrentAudio();
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
  const voicesBefore = synth?.getVoices().length ?? 0;
  const synthState = synth ? getSynthStateString(synth) : "speechSynthesis=missing";
  pushDiagnostic("unlock_called", `voicesBefore=${voicesBefore} ${synthState}`);
  voiceUnlocked = true;
  if (synth) {
    synth.onvoiceschanged = () => {
      pushDiagnostic("voices_changed", `voicesNow=${synth.getVoices().length}`);
      synth.onvoiceschanged = null;
    };
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
    if (synth) {
      const warmup = new SpeechSynthesisUtterance(".");
      warmup.volume = 0;
      warmup.rate = 1;
      warmup.pitch = 1;
      pushDiagnostic("unlock_warmup_started", "silent warmup utterance dispatched");
      warmup.onend = () => {
        if (!active && queue.length) drain(DEFAULT_CONFIG);
      };
      synth.speak(warmup);
    }
  } catch {
    pushDiagnostic("unlock_warmup_error", "warmup utterance failed");
  }

  const voicesAfter = synth?.getVoices().length ?? 0;
  const synthStateAfter = synth ? getSynthStateString(synth) : "speechSynthesis=missing";
  pushDiagnostic("runtime_check", `voicesAfter=${voicesAfter} ${synthStateAfter}`);
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

  playbackToken += 1;
  stopCurrentAudio();
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
    supported: true,
    unlocked: voiceUnlocked,
    queueLength: queue.length,
    active,
    voicesCount: synth?.getVoices().length ?? 1,
    selectedVoiceName: lastSelectedVoiceName ?? "piper-local",
    paused: false,
    pending: active || queue.length > 0,
    speaking: Boolean(currentAudio && !currentAudio.paused),
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
  const { interrupt = false } = options;
  const result = await generateCoachReply(userText, options);
  if (result.reply) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    speak(result.reply, interrupt);
  }
  return result;
}