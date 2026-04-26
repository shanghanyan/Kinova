"use client";

import type { GameState, World } from "@/lib/types";

const WORLDS: World[] = [
  {
    id: "hiphop",
    name: "CYBER STAGE",
    style: "HIP HOP",
    icon: "HH",
    desc: "Futuristic neon arena. Lock, pop, and break through digital dimensions.",
    bg: "linear-gradient(135deg,#0d1b3e,#1a0d4d)",
    accent: "var(--agi)",
    minLevel: 1,
  },
  {
    id: "latin",
    name: "TROPICAL FEST",
    style: "LATIN",
    icon: "LT",
    desc: "Vibrant carnival grounds. Salsa and merengue under golden light.",
    bg: "linear-gradient(135deg,#2d1a00,#3d2800)",
    accent: "var(--pow)",
    minLevel: 1,
  },
  {
    id: "saber",
    name: "SABER DOJO",
    style: "SABER",
    icon: "SB",
    desc: "Precision movement art. Flow with blade and beat.",
    bg: "linear-gradient(135deg,#0a2a1a,#0f1f0f)",
    accent: "var(--success)",
    minLevel: 2,
  },
  {
    id: "soul",
    name: "SOUL TEMPLE",
    style: "FREESTYLE",
    icon: "FS",
    desc: "Ancient rhythms, modern moves. Unlock pure expression.",
    bg: "linear-gradient(135deg,#2d0a2d,#1a0d1a)",
    accent: "var(--sta)",
    minLevel: 3,
  },
];

interface WorldsScreenProps {
  state: GameState;
  onNav: (screen: string) => void;
  onSelectWorld: (world: World) => void;
}

export function WorldsScreen({ state, onNav, onSelectWorld }: WorldsScreenProps) {
  return (
    <div className="p-6 pb-24">
      <div className="mb-4 flex items-center gap-3">
        <button className="btn btn-ghost px-4 py-2 text-xs" onClick={() => onNav("home")}>
          BACK
        </button>
        <div className="font-display text-lg font-black">WORLDS</div>
      </div>
      <div className="mb-4 font-display text-[10px] tracking-[0.1em] text-[var(--muted)]">
        SELECT A DANCE WORLD - LEVEL {state.level}
      </div>
      <div className="space-y-3">
        {WORLDS.map((world) => {
          const locked = state.level < world.minLevel;
          return (
            <div
              key={world.id}
              className={`world-card ${locked ? "locked" : ""}`}
              style={{ background: world.bg, boxShadow: locked ? "none" : `0 0 24px ${world.accent}22` }}
              onClick={() => !locked && onSelectWorld(world)}
            >
              <div className="world-content">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1 font-display text-[9px] tracking-[0.12em]" style={{ color: world.accent }}>
                      {world.style}
                    </div>
                    <div className="font-display text-[22px] font-black">
                      {world.icon} {world.name}
                    </div>
                  </div>
                  {locked && (
                    <div className="rounded-lg bg-white/10 px-3 py-1 font-display text-[10px] text-[var(--muted)]">
                      LVL {world.minLevel}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-[13px] leading-relaxed text-white/60">{world.desc}</div>
                {!locked && (
                  <div className="mt-3">
                    <button className="btn px-4 py-2 text-[10px]" style={{ background: world.accent, color: "#07090f" }}>
                      ENTER WORLD
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
