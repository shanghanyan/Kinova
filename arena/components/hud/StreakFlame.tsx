interface Props {
  streak: number;
}

export function StreakFlame({ streak }: Props) {
  return <div className="font-mono font-bold">🔥 {streak}</div>;
}
