import { XPBar } from './XPBar';
import { StreakFlame } from './StreakFlame';

interface Props {
  character: string;
  level: number;
  xp: number;
  streak: number;
}

export function HUD({ character, level, xp, streak }: Props) {
  return (
    <div className="h-14 bg-bg-card/80 backdrop-blur border-b border-border sticky top-0 z-20 px-4 flex items-center justify-between">
      <div className="font-display">{character}</div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-text-2">Lv.{level}</div>
        <XPBar xp={xp} />
      </div>
      <StreakFlame streak={streak} />
    </div>
  );
}
