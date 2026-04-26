"use client";

import { useCallback, useEffect, useState } from "react";
import type { GameState, World } from "@/lib/types";
import { FeedbackChip } from "@/components/ui/FeedbackChip";
import { Dragon } from "@/components/ui/Dragon";
import { DancePoseCamera } from "@/components/DancePoseCamera";
import { useVoiceInput } from "@/lib/useVoiceInput";
import { speak } from "@/lib/voice";

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface DanceScreenProps {
  world: World;
  state: GameState;
  onRep: (data: { stat: string | null; xp: number }) => void;
  onNav: (screen: string) => void;
}

export function DanceScreen({ world, state, onRep, onNav }: DanceScreenProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: "perfect" | "good" | "miss" } | null>(null);
  const [beat, setBeat] = useState(0);
  const [movement, setMovement] = useState(0);
  const [bpm] = useState(120);
  const { isListening, supported, start, stop } = useVoiceInput((transcript) => {
    speak(`Love that vibe: ${transcript}. Keep moving!`, true);
  });

  const handleMove = useCallback((quality: "perfect" | "good" | "miss") => {
    const pts = { perfect: 100, good: 60, miss: 10 };
    const f = {
      perfect: { text: "PERFECT!", type: "perfect" as const },
      good: { text: "NICE MOVE", type: "good" as const },
      miss: { text: "MISS", type: "miss" as const },
    };
    setFeedback(f[quality]);
    setCombo((c) => (quality === "miss" ? 0 : c + 1));
    setScore((s) => s + pts[quality] * (combo >= 5 ? 2 : 1));
    onRep({ stat: "sta", xp: pts[quality] / 10 });
    setTimeout(() => setFeedback(null), 900);
  }, [combo, onRep]);

  useEffect(() => {
    const beatMs = (60 / bpm) * 1000;
    const win = window as WindowWithWebkitAudio;
    const AudioCtx = globalThis.AudioContext || win.webkitAudioContext;
    const ac = AudioCtx ? new AudioCtx() : null;
    const id = setInterval(() => {
      setBeat((b) => b + 1);
      if (movement > 85) handleMove("perfect");
      else if (movement > 45) handleMove("good");
      else if (movement > 1) handleMove("miss");
      if (ac) {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.frequency.value = 880;
        gain.gain.value = 0.03;
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.05);
      }
    }, beatMs);
    return () => clearInterval(id);
  }, [bpm, movement, handleMove]);

  return (
    <div className="p-6 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost px-4 py-2 text-xs" onClick={() => onNav("worlds")}>
          ← WORLDS
        </button>
        <div className="text-center">
          <div className="font-display text-[9px] tracking-[0.1em]" style={{ color: world.accent }}>
            {world.style}
          </div>
          <div className="font-display text-base font-black">{world.name}</div>
        </div>
        <div className="font-display text-xl font-black text-[var(--xp)]">{score.toLocaleString()}</div>
      </div>

      <div className="mb-3 flex justify-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="beat-dot"
            style={{
              animationDelay: `${i * 0.125}s`,
              background: i === beat % 4 ? world.accent : "var(--surface2)",
              boxShadow: i === beat % 4 ? `0 0 10px ${world.accent}` : undefined,
            }}
          />
        ))}
      </div>

      <div className="mb-3 grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <DancePoseCamera onMovement={setMovement} pulse />
        </div>
        <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-3">
          <div className="mb-3 flex justify-center">
            <Dragon size={Math.min(130, 56 + combo * 2)} state={feedback?.type === "perfect" ? "energized" : "idle"} level={state.level} />
          </div>
          <div className="mb-2 text-center font-display text-xs text-[var(--muted)]">BPM {bpm}</div>
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
        </div>
      </div>

      <div className="cam-feed mb-3 h-[120px]" style={{ border: `1px dashed ${world.accent}44` }}>
        {feedback && (
          <div className="absolute left-0 right-0 top-4 flex justify-center">
            <FeedbackChip text={feedback.text} type={feedback.type} />
          </div>
        )}
        {combo >= 3 && (
          <div className="absolute right-3 top-3">
            <div className="combo-text text-xl">x{combo}!</div>
          </div>
        )}
        <div className="absolute bottom-3 left-3 font-display text-[9px] tracking-[0.1em]" style={{ color: world.accent }}>
          ▶ GUIDE AVATAR ACTIVE • MOVEMENT {Math.round(movement)}
        </div>
      </div>

      <div className="card flex justify-around text-center">
        {[
          { l: "COMBO", v: `x${combo}`, c: "var(--xp)" },
          { l: "STAMINA", v: state.stats.sta, c: "var(--sta)" },
          { l: "SCORE", v: score.toLocaleString(), c: world.accent },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-display text-xl font-black" style={{ color: s.c }}>
              {s.v}
            </div>
            <div className="font-display text-[9px] tracking-[0.08em] text-[var(--muted)]">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
