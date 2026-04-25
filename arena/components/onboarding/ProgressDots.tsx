interface Props {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all ${index <= current ? 'bg-xp w-8' : 'bg-white/20 w-2'}`}
        />
      ))}
    </div>
  );
}
