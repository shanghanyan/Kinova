'use client';

import { useState, useCallback, useRef } from 'react';
import { Mic } from 'lucide-react';

interface Props {
  onTranscript: (text: string) => void;
  characterColor?: string;
}

export function VoiceButton({ onTranscript, characterColor = '#fbbf24' }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setInterimText(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        onTranscript(transcript);
        setInterimText('');
        setIsListening(false);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
        style={{
          background: isListening ? characterColor : 'var(--bg-raised)',
          border: `2px solid ${isListening ? characterColor : 'var(--border-2)'}`,
          boxShadow: isListening ? `0 0 20px ${characterColor}66` : 'none',
        }}
      >
        <Mic size={22} color={isListening ? 'black' : 'var(--text-2)'} />
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: characterColor }} />
            <div className="absolute -inset-2 rounded-full animate-ping opacity-20" style={{ background: characterColor }} />
          </>
        )}
      </button>
      {interimText && <div className="text-xs font-body text-text-2 max-w-[120px] text-center italic">&quot;{interimText}&quot;</div>}
      {!isListening && !interimText && <div className="text-xs font-body text-text-3 text-center">Hold to talk</div>}
    </div>
  );
}
