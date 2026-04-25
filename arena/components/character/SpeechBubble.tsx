'use client';

interface Props {
  text: string;
  className?: string;
}

export function SpeechBubble({ text, className = '' }: Props) {
  return (
    <div className={`relative bg-white text-black rounded-2xl px-4 py-2 text-sm font-bold max-w-xs shadow-xl ${className}`}>
      {text}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0"
        style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid white' }}
      />
    </div>
  );
}
