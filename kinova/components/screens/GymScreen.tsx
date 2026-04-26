"use client";

import { useMemo, useState } from "react";
import { PoseCamera, SetData } from "../PoseCamera";
import type { GameState } from "@/lib/types";
import { FeedbackChip } from "@/components/ui/FeedbackChip";
import { Dragon } from "@/components/ui/Dragon";
import { useVoiceInput } from "@/lib/useVoiceInput";
import { speak, speakDebounced } from "@/lib/voice";

interface GymScreenProps {
  state: GameState;
  onRep: (data: { stat: string | null; xp: number }) => void;
  onNav: (screen: string) => void;
  onSetComplete: (data: SetData) => void;
}

export function GymScreen({ state, onRep, onNav, onSetComplete }: GymScreenProps) {
  const [exIdx, setExIdx] = useState(0);
  const [isTraining, setIsTraining] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; type: "perfect" | "good" | "fix" } | null>(null);
  const [combo, setCombo] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [goodRepCount, setGoodRepCount] = useState(0);
  const [lastVoice, setLastVoice] = useState("");
  const exercises = ["SQUAT", "PUSH-UP", "LUNGE", "PLANK HOLD", "DEADLIFT"];
  const { isListening, supported, start, stop } = useVoiceInput((transcript) => {
    const answer = `I heard "${transcript}". Keep your chest up and control the tempo.`;
    setLastVoice(answer);
    speak(answer, true);
  });
  const dragonSize = useMemo(() => Math.min(130, 58 + goodRepCount * 2), [goodRepCount]);

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
    if (quality !== "fix") setGoodRepCount((n) => n + 1);
    if (quality === "perfect") speakDebounced("Perfect rep. Keep this quality.");
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

      {isTraining && (
        <div className="relative grid grid-cols-4 gap-3">
          <div className="col-span-3">
          <PoseCamera
            exerciseName={exercises[exIdx % exercises.length]}
            userInjuries={[]}
            targetReps={10}
            onRep={handleRepComplete}
            onSetComplete={(data) => {
              onSetComplete(data);
              setIsTraining(false);
            }}
            onFormUpdate={({ score, errors }) => {
              setFormScore(score);
              if (errors[0]) speakDebounced(errors[0].replaceAll("_", " "), 3000);
            }}
          />
          </div>
          <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-3">
            <div className="mb-2 text-center font-display text-[10px] tracking-[0.08em] text-[var(--muted)]">
              GUIDE
            </div>
            <div className="mb-3 flex justify-center">
              <Dragon size={dragonSize} state={feedback?.type === "perfect" ? "energized" : "idle"} level={state.level} />
            </div>
            <div className="mb-2 rounded-lg bg-black/20 p-2 text-center font-display text-xs">
              FORM: <span style={{ color: formScore >= 80 ? "#a3e635" : formScore >= 60 ? "#fbbf24" : "#f87171" }}>{Math.round(formScore)}</span>
            </div>
            <div className="mb-3 rounded-lg bg-black/20 p-2 text-center font-display text-xs">GOOD REPS: {goodRepCount}</div>
            {supported && (
              <button
                className="btn btn-ghost w-full px-2 py-2 text-[10px]"
                onPointerDown={start}
                onPointerUp={stop}
                onPointerLeave={stop}
              >
                {isListening ? "🎙 LISTENING..." : "🎤 HOLD TO TALK"}
              </button>
            )}
            {lastVoice && <div className="mt-2 text-xs text-[var(--muted)]">{lastVoice}</div>}
          </div>
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
