"use client";

import { useState } from "react";
import type { GameState } from "@/lib/types";
import { Dragon } from "@/components/ui/Dragon";
import { FeedbackChip } from "@/components/ui/FeedbackChip";
import { SkeletonFigure } from "@/components/ui/SkeletonFigure";

interface BossScreenProps {
  state: GameState;
  onRep: (data: { stat: string | null; xp: number }) => void;
  onEvolve: () => void;
  onNav: (screen: string) => void;
}

export function BossScreen({ state, onRep, onEvolve, onNav }: BossScreenProps) {
  const [charge, setCharge] = useState(0);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<"intro" | "trial" | "evolved">("intro");
  const [feedback, setFeedback] = useState<{ text: string; type: "perfect" | "good" | "fix" } | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const handleRep = (quality: "perfect" | "good" | "fix") => {
    const gain = quality === "perfect" ? 8 : quality === "good" ? 4 : 1;
    const f = {
      perfect: { text: "CHARGE SURGE!", type: "perfect" as const },
      good: { text: "GOOD FORM", type: "good" as const },
      fix: { text: "IMPROVE FORM", type: "fix" as const },
    };
    setFeedback(f[quality]);
    setReps((r) => r + 1);
    setCharge((c) => {
      const next = Math.min(100, c + gain);
      if (next >= 100) {
        setTimeout(() => {
          setShowFlash(true);
          setTimeout(() => {
            setShowFlash(false);
            setPhase("evolved");
            onEvolve();
          }, 600);
        }, 300);
      }
      return next;
    });
    onRep({ stat: quality !== "fix" ? "pow" : null, xp: gain });
    setTimeout(() => setFeedback(null), 1000);
  };

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 pb-24 text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(180,79,255,0.2)_0%,transparent_70%)]" />
          <Dragon size={176} state="evolving" level={state.level} />
        </div>
        <div className="mb-2 font-display text-[10px] tracking-[0.15em] text-[var(--sta)]">CREATURE TRIAL</div>
        <div className="mb-3 font-display text-3xl font-black leading-tight">YOUR DRAGON IS READY TO EVOLVE</div>
        <div className="mb-8 max-w-[280px] text-sm leading-relaxed text-[var(--muted)]">
          Complete the trial with perfect form to charge the evolution meter.
        </div>
        <button className="btn btn-sta px-10 py-4 text-[13px]" onClick={() => setPhase("trial")}>
          START TRIAL
        </button>
        <button className="btn btn-ghost mt-3 px-4 py-2 text-[10px]" onClick={() => onNav("home")}>
          BACK
        </button>
      </div>
    );
  }

  if (phase === "evolved") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 pb-24 text-center">
        <div className="mb-3 font-display text-[10px] tracking-[0.15em] text-[var(--xp)]">EVOLUTION COMPLETE</div>
        <div className="relative mb-6">
          <div className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(255,224,51,0.25)_0%,transparent_70%)]" />
          <Dragon size={192} state="evolving" level={state.level + 1} />
        </div>
        <div className="mb-1 font-display text-4xl font-black text-[var(--xp)]">LEVEL {state.level + 1}!</div>
        <div className="mb-1 text-sm text-[var(--muted)]">{reps} reps - trial complete</div>
        <div className="mb-8 font-display text-[11px] text-[var(--success)]">NEW WORLD UNLOCKED</div>
        <button className="btn btn-xp px-8 py-4 text-xs" onClick={() => onNav("home")}>
          CONTINUE
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-6 pb-24">
      {showFlash && <div className="evo-flash" />}
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-[9px] tracking-[0.12em] text-[var(--sta)]">CREATURE TRIAL</div>
        <div className="flex items-baseline gap-2">
          <div className="rep-counter text-[32px]">{reps}</div>
          <div className="font-display text-[10px] text-[var(--muted)]">REPS</div>
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-2 flex justify-between">
          <div className="font-display text-[10px] tracking-[0.1em] text-[var(--muted)]">EVOLUTION CHARGE</div>
          <div className="font-display text-sm font-black text-[var(--sta)]">{charge}%</div>
        </div>
        <div className="charge-meter">
          <div className="charge-fill" style={{ width: `${charge}%` }} />
        </div>
      </div>
      <div className="cam-feed mb-4 h-[220px] border-[1px] border-dashed border-[rgba(180,79,255,0.3)]">
        <div className="skeleton-overlay">
          <SkeletonFigure />
        </div>
        <div className="absolute bottom-3 right-3">
          <Dragon size={70} state={charge > 50 ? "evolving" : "idle"} level={state.level} />
        </div>
        {feedback && (
          <div className="absolute left-0 right-0 top-4 flex justify-center">
            <FeedbackChip text={feedback.text} type={feedback.type} />
          </div>
        )}
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <button className="btn btn-xp px-2 py-3 text-[10px]" onClick={() => handleRep("perfect")}>
          PERFECT
        </button>
        <button className="btn btn-pow px-2 py-3 text-[10px]" onClick={() => handleRep("good")}>
          GOOD
        </button>
        <button className="btn btn-ghost px-2 py-3 text-[10px]" onClick={() => handleRep("fix")}>
          FIX
        </button>
      </div>
      <div className="card text-center">
        <div className="mb-1 font-display text-[11px] text-[var(--muted)]">DRAGON STATUS</div>
        <div className="text-sm text-[var(--muted)]">
          {charge < 30
            ? "Charging... Keep going!"
            : charge < 70
              ? "Energy building! Maintain form!"
              : "Almost there - push through!"}
        </div>
      </div>
    </div>
  );
}
