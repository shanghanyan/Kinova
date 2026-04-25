export function MoveDisplay({ move, direction }: { move: string; direction: string }) {
  const arrows = {
    'side-to-side': '← →',
    'up-down': '↑ ↓',
    'forward-back': '↑ ↓',
    spin: '↻',
    freestyle: '✦',
  } as const;

  return (
    <div className="card text-center">
      <div className="text-sm text-text-2">Current move</div>
      <div className="font-body font-extrabold text-lg">{move}</div>
      <div className="text-3xl mt-2">{arrows[direction as keyof typeof arrows] ?? '↑ ↓ ← →'}</div>
    </div>
  );
}
