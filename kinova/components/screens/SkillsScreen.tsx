"use client";

import { useState } from "react";
import type { GameState } from "@/lib/types";
import { Dragon } from "@/components/ui/Dragon";

interface SkillsScreenProps {
  state: GameState;
  onNav: (screen: string) => void;
}

export function SkillsScreen({ state, onNav }: SkillsScreenProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const statTag = {
    pow: { label: "POWER", color: "#ff5f2e", bg: "rgba(255,95,46,0.15)" },
    agi: { label: "AGILITY", color: "#00e5ff", bg: "rgba(0,229,255,0.15)" },
    sta: { label: "STAMINA", color: "#b44fff", bg: "rgba(180,79,255,0.15)" },
  } as const;
  const skills = [
    {
      id: "dragon_breath",
      tier: 1,
      icon: "🐉",
      name: "Dragon Breath",
      desc: "Controlled exhale and core bracing on heavy reps.",
      stats: ["pow", "sta"] as const,
      unlocked: true,
      requires: [] as string[],
    },
    {
      id: "lightning_step",
      tier: 1,
      icon: "⚡",
      name: "Lightning Step",
      desc: "Explosive lateral cuts and quick-feet patterns.",
      stats: ["agi", "sta"] as const,
      unlocked: true,
      requires: [] as string[],
    },
    {
      id: "iron_scales",
      tier: 2,
      icon: "🛡️",
      name: "Iron Scales",
      desc: "Full-body tension holds and stability training.",
      stats: ["pow", "agi"] as const,
      unlocked: true,
      requires: ["dragon_breath"],
    },
    {
      id: "storm_dance",
      tier: 3,
      icon: "💃",
      name: "Storm Dance",
      desc: "Dance-HIIT fusion to test full-body control.",
      stats: ["agi", "sta", "pow"] as const,
      unlocked: false,
      requires: ["iron_scales"],
    },
  ];
  const byTier = [1, 2, 3, 4].map((t) => skills.filter((s) => s.tier === t));
  const tierLabels = ["FOUNDATION", "CORE SKILLS", "ADVANCED", "ELITE"];

  return (
    <div className="p-6 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button className="btn btn-ghost px-4 py-2 text-xs" onClick={() => onNav("home")}>
          ← BACK
        </button>
        <div className="font-display text-lg font-black">SKILL TREE</div>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <Dragon size={46} state="idle" level={state.level} />
        <div>
          <div className="font-display text-[13px] font-black">{state.creature.name}</div>
          <div className="font-display text-[9px] tracking-[0.08em] text-[var(--muted)]">
            LVL {state.level} - {skills.filter((s) => s.unlocked).length}/{skills.length} SKILLS UNLOCKED
          </div>
        </div>
      </div>

      {byTier.map((tierSkills, ti) => (
        <div key={ti} className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="font-display text-[9px] tracking-[0.12em] text-[var(--muted)]">
              {tierLabels[ti]} - TIER {ti + 1}
            </div>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="flex flex-col gap-2">
            {tierSkills.map((sk) => (
              <div
                key={sk.id}
                className={`skill-card ${sk.unlocked ? "unlocked" : "locked"} ${selected === sk.id ? "active-skill" : ""}`}
                style={{ borderColor: selected === sk.id ? "var(--xp)" : undefined }}
                onClick={() => sk.unlocked && setSelected(selected === sk.id ? null : sk.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface)] text-2xl">
                    {sk.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-display text-[11px] font-bold">{sk.name}</span>
                      {sk.unlocked && <div className="h-[7px] w-[7px] rounded-full bg-[var(--success)]" />}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sk.stats.map((st) => (
                        <span key={st} className="skill-tag" style={{ color: statTag[st].color, background: statTag[st].bg }}>
                          {statTag[st].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {selected === sk.id && (
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <div className="text-[13px] leading-relaxed text-white/70">{sk.desc}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
