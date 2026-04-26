"use client";

import type { GameState } from "@/lib/types";
import { Dragon } from "@/components/ui/Dragon";
import { StatRing } from "@/components/ui/StatRing";

interface HomeScreenProps {
  state: GameState;
  onNav: (screen: string) => void;
}

export function HomeScreen({ state, onNav }: HomeScreenProps) {
  const { creature, stats, xp, xpMax, level, streak, missions } = state;
  const statsReady = stats.pow >= 90 && stats.agi >= 90 && stats.sta >= 90;

  return (
    <div className="min-h-screen px-5 pb-24 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-[10px] tracking-[0.1em] text-[var(--muted)]">LEVEL {level}</div>
          <div className="font-display text-xl font-black tracking-[0.04em]">{creature.name}</div>
        </div>
        <div className="streak-badge">🔥 {streak} DAY STREAK</div>
      </div>

      <div className="mb-7">
        <div className="mb-1 flex justify-between">
          <span className="font-display text-[9px] tracking-[0.08em] text-[var(--muted)]">XP TO NEXT LEVEL</span>
          <span className="font-display text-[9px] text-[var(--xp)]">
            {xp} / {xpMax}
          </span>
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-bar-fill" style={{ width: `${(xp / xpMax) * 100}%` }} />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
        <StatRing value={stats.pow} color="var(--pow)" label="POWER" icon="🔥" />
        <div className="flex flex-col items-center gap-3">
          <Dragon size={148} state={creature.state} level={level} />
          {statsReady && (
            <button className="btn btn-xp px-5 py-2 text-[10px]" onClick={() => onNav("boss")}>
              READY TO EVOLVE
            </button>
          )}
        </div>
        <StatRing value={stats.agi} color="var(--agi)" label="AGILITY" icon="⚡" />
      </div>
      <div className="mb-8 flex justify-center">
        <StatRing value={stats.sta} color="var(--sta)" label="STAMINA" icon="💜" />
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <button className="btn btn-pow px-2 py-3 text-[10px]" onClick={() => onNav("gym")}>
          💪 TRAIN
        </button>
        <button className="btn btn-sta px-2 py-3 text-[10px]" onClick={() => onNav("worlds")}>
          🌍 PERFORM
        </button>
        <button className="btn btn-ghost px-2 py-3 text-[10px]" onClick={() => onNav("skills")}>
          🌳 SKILLS
        </button>
      </div>

      <div>
        <div className="mb-3 font-display text-[10px] tracking-[0.1em] text-[var(--muted)]">DAILY MISSIONS</div>
        <div className="flex flex-col gap-2">
          {missions.map((m, i) => (
            <div className="mission-row" key={i}>
              <div className="mission-check" style={{ background: m.done ? "var(--success)" : "var(--surface)" }}>
                {m.done ? "✓" : m.icon}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium">{m.label}</div>
                <div className="text-[11px] text-[var(--muted)]">{m.desc}</div>
              </div>
              <div className="font-display text-[11px] text-[var(--xp)]">+{m.xp} XP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
