export function RepCounter({ current, target }: { current: number; target: number }) {
  return (
    <div className="font-display text-4xl leading-none">
      <span className="font-mono text-5xl">{current}</span>
      <span className="text-xl text-text-2"> / {target}</span>
    </div>
  );
}
