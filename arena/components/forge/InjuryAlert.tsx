interface Props {
  open: boolean;
  onStop: () => void;
  onContinue: () => void;
}

export function InjuryAlert({ open, onStop, onContinue }: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 bg-red-500/20 border-2 border-red-400 animate-pulse z-20 flex items-start justify-center p-4">
      <div className="card max-w-md w-full border border-red-400">
        <div className="font-display text-2xl text-red-300">⚠️ Form Breaking Down - PAUSE</div>
        <div className="mt-3 flex gap-2">
          <button onClick={onStop} className="px-4 py-2 rounded-[12px] bg-red-500 text-white font-bold">STOP SET</button>
          <button onClick={onContinue} className="px-4 py-2 rounded-[12px] bg-bg-raised text-text font-bold">I&apos;M FINE, CONTINUE</button>
        </div>
      </div>
    </div>
  );
}
