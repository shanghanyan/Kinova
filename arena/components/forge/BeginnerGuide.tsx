interface Props {
  what: string;
  why: string;
  feel: string;
  tip: string;
}

export function BeginnerGuide({ what, why, feel, tip }: Props) {
  return (
    <div className="card space-y-2">
      <div className="font-display text-xl">What is this exercise?</div>
      <p>{what}</p>
      <div className="text-text-2 text-sm">Why do it: {why}</div>
      <div className="text-text-2 text-sm">What you will feel: {feel}</div>
      <div className="text-xp text-sm">Beginner tip: {tip}</div>
    </div>
  );
}
