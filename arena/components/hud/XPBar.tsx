import { xpToNextLevel } from '@/lib/xp';

interface Props {
  xp: number;
}

export function XPBar({ xp }: Props) {
  const info = xpToNextLevel(xp);
  return (
    <div className="min-w-56">
      <div className="text-xs text-text-2 font-mono mb-1">{info.current} / {info.needed} XP</div>
      <div className="h-2 rounded-full bg-bg-raised overflow-hidden">
        <div className="h-full bg-xp transition-all" style={{ width: `${info.percent}%` }} />
      </div>
    </div>
  );
}
