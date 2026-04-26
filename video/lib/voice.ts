let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, interrupt = false): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  if (interrupt) {
    window.speechSynthesis.cancel();
  } else if (window.speechSynthesis.speaking) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.1;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.includes('Neural') ||
      v.name.includes('Premium') ||
      v.name.includes('Daniel') ||
      v.name.includes('Samantha')
  );
  if (preferred) utterance.voice = preferred;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (typeof window !== 'undefined') {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
