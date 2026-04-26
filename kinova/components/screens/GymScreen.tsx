"use client";

import { useState } from "react";
import { PoseCamera, SetData } from "../PoseCamera";
import type { GameState } from "@/lib/types";
import { FeedbackChip } from "@/components/ui/FeedbackChip";
import { Dragon } from "@/components/ui/Dragon";

interface GymScreenProps {
  state: GameState;
  onRep: (data: { stat: string | null; xp: number }) => void;
  onNav: (screen: string) => void;
  onSetComplete: (data: SetData) => void;
}

export function GymScreen({ state, onRep, onNav, onSetComplete }: GymScreenProps) {
  const [exIdx, setExIdx] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "perfect" | "good" | "fix" } | null>(null);
  const [combo, setCombo] = useState(0);
  const exercises = ["SQUAT", "PUSH-UP", "LUNGE", "PLANK HOLD", "DEADLIFT"];

  const handleRepComplete = (payload: { rep: number; score: number }) => {
    const quality: "perfect" | "good" | "fix" =
      payload.score >= 85 ? "perfect" : payload.score >= 65 ? "good" : "fix";
    const statMap = {
      perfect: { stat: "pow", xp: 20 },
      good: { stat: "agi", xp: 10 },
      fix: { stat: null, xp: 2 },
    } as const;
    onRep(statMap[quality]);
    setFeedback({
      text: quality === "perfect" ? "PERFECT!" : quality === "good" ? "GOOD" : "FIX FORM",
      type: quality,
    });
    setCombo((c) => (quality === "fix" ? 0 : c + 1));
    setTimeout(() => setFeedback(null), 900);
  };

  return (
    <div className="p-6 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button className="btn btn-ghost px-4 py-2 text-xs" onClick={() => onNav("home")}>
          ← BACK
        </button>
        <div className="font-display text-lg font-black tracking-wide">GYM SESSION</div>
      </div>

      <div className="mb-4 text-center">
        <div className="mb-1 font-display text-[11px] tracking-widest text-[var(--muted)]">CURRENT EXERCISE</div>
        <div className="font-display text-2xl font-black text-[var(--pow)]">{exercises[exIdx % exercises.length]}</div>
      </div>

      {!isTraining ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface2)]">
          <span className="text-4xl">🎯</span>
          <button className="btn btn-pow px-6 py-3 text-xs" onClick={() => setIsTraining(true)}>
            START TRAINING
          </button>
        </div>
      ) : (
        <div className="relative">
          <PoseCamera
            exerciseName={exercises[exIdx % exercises.length]}
            userInjuries={[]}
            targetReps={10}
            onRep={handleRepComplete}
            onSetComplete={(data) => {
              onSetComplete(data);
              setIsTraining(false);
            }}
          />
          {feedback && (
            <div className="absolute left-0 right-0 top-4 flex justify-center">
              <FeedbackChip text={feedback.text} type={feedback.type} />
            </div>
          )}
          {combo >= 3 && (
            <div className="absolute left-3 top-3">
              <div className="combo-text">x{combo} COMBO!</div>
            </div>
          )}
          <div className="absolute bottom-3 right-3">
            <Dragon size={58} state={feedback?.type === "perfect" ? "energized" : "idle"} level={state.level} />
          </div>
        </div>
      )}

      <div className="my-4 flex items-baseline justify-center gap-2">
        <div className="rep-counter">{state.reps}</div>
        <div className="font-display text-xs text-[var(--muted)]">REPS</div>
      </div>

      <button className="btn btn-ghost mt-4 w-full text-xs" onClick={() => setExIdx((i) => i + 1)}>
        NEXT EXERCISE →
      </button>
    </div>
  );
}
