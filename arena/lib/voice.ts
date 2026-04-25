type CharacterId = 'spark' | 'zen' | 'pixel' | 'nova';

const VOICE_SETTINGS: Record<CharacterId, { rate: number; pitch: number }> = {
  spark: { rate: 1.15, pitch: 1.1 },
  zen: { rate: 0.88, pitch: 0.95 },
  pixel: { rate: 1.0, pitch: 0.78 },
  nova: { rate: 1.2, pitch: 1.2 },
};

const speechQueue: string[] = [];
let isSpeaking = false;

export function characterSpeak(text: string, characterId: string, interrupt = false): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  if (interrupt) {
    window.speechSynthesis.cancel();
    speechQueue.length = 0;
    isSpeaking = false;
  }

  speechQueue.push(text);
  if (!isSpeaking) drainQueue((characterId as CharacterId) || 'spark');
}

function drainQueue(characterId: CharacterId) {
  if (!speechQueue.length) {
    isSpeaking = false;
    return;
  }

  isSpeaking = true;
  const text = speechQueue.shift();
  if (!text) return;

  const u = new SpeechSynthesisUtterance(text);
  const settings = VOICE_SETTINGS[characterId] || VOICE_SETTINGS.spark;
  u.rate = settings.rate;
  u.pitch = settings.pitch;
  u.volume = 1.0;

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      v.name.includes('Neural') || v.name.includes('Premium') ||
      v.name.includes('Samantha') || v.name.includes('Daniel') ||
      v.name.includes('Karen') || v.name.includes('Moira')
    );
    if (preferred) u.voice = preferred;
    u.onend = () => drainQueue(characterId);
    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.getVoices().length > 0) pickVoice();
  else window.speechSynthesis.onvoiceschanged = pickVoice;
}

export const stopSpeaking = () => {
  window.speechSynthesis?.cancel();
  speechQueue.length = 0;
  isSpeaking = false;
};
