interface VoiceConfig {
  rate: number;
  pitch: number;
}

const queue: string[] = [];
let active = false;
const lastSpoken: Record<string, number> = {};

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  return (
    voices.find((v) => v.name === "Samantha") ||
    voices.find((v) => v.name.includes("Google US English")) ||
    voices.find((v) => v.name.includes("Neural")) ||
    voices.find((v) => v.lang === "en-US") ||
    voices[0] ||
    null
  );
}

function drain(config: VoiceConfig): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  if (!queue.length) {
    active = false;
    return;
  }

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
    u.rate = config.rate;
    u.pitch = config.pitch;
    u.volume = 0.95;
    const voice = pickVoice(synth);
    if (voice) u.voice = voice;
    u.onend = () => {
      idx += 1;
      speakNext();
    };
    u.onerror = () => {
      idx += 1;
      speakNext();
    };
    synth.speak(u);
  };

  if (synth.getVoices().length > 0) speakNext();
  else synth.onvoiceschanged = () => speakNext();
}

export function speak(text: string, interrupt = false, config: VoiceConfig = { rate: 1.05, pitch: 1.0 }) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  const clean = cleanMarkdown(text);
  if (!clean) return;

  if (interrupt) {
    synth.cancel();
    queue.length = 0;
    active = false;
  }

  queue.push(clean);
  if (!active) drain(config);
}

export function speakDebounced(text: string, debounceMs = 4000, config?: VoiceConfig) {
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
