let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, interrupt = false) {
  if (typeof window === "undefined") return;

  if (interrupt) {
    window.speechSynthesis.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = 1.1;
  currentUtterance.pitch = 1.0;
  currentUtterance.volume = 0.8;

  window.speechSynthesis.speak(currentUtterance);
}

export function cancelSpeech() {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}
