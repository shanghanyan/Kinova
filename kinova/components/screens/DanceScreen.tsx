"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, World } from "@/lib/types";
import { FeedbackChip } from "@/components/ui/FeedbackChip";
import { Dragon } from "@/components/ui/Dragon";
import { PoseCamera } from "@/components/PoseCamera";
import { generateAndSpeakCoachReply, speak, unlockVoice } from "@/lib/voice";

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface DanceScreenProps {
  world: World;
  state: GameState;
  onRep: (data: { stat: string | null; xp: number }) => void;
  onNav: (screen: string) => void;
  isActive?: boolean;
}

export function DanceScreen({ world, state, onRep, onNav, isActive = true }: DanceScreenProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: "perfect" | "good" | "miss" } | null>(null);
  const [beat, setBeat] = useState(0);
  const [movement, setMovement] = useState(0);
  const [lastVoice, setLastVoice] = useState("");
  const [moveCue, setMoveCue] = useState("Ready stance");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const lastCueAtRef = useRef(0);
  const cuePendingRef = useRef(false);
  const movementRef = useRef(0);
  const comboRef = useRef(0);
  const onRepRef = useRef(onRep);
  const defaultCueIdxRef = useRef(0);
  const randomCueOffsetRef = useRef(0);

  const hasSpeedSkill = state.activeSkills.includes("lightning_step") || state.activeSkills.includes("storm_dance");
  const hasStrengthSkill =
    state.activeSkills.includes("dragon_breath") ||
    state.activeSkills.includes("iron_scales") ||
    state.activeSkills.includes("storm_dance");
  const hasAgilitySkill =
    state.activeSkills.includes("lightning_step") ||
    state.activeSkills.includes("iron_scales") ||
    state.activeSkills.includes("storm_dance");

  const bpm = hasSpeedSkill ? 170 : 140;
  const cueIntervalMs = Math.max(6500, Math.round(((60 / bpm) * 1000) * 12));

  const getFallbackCue = useCallback(() => {
    const baseCues = [
      "Step right and tap",
      "Step left and tap",
      "Two-count bounce in place",
      "Lift knees and hold rhythm",
      "Small hop then reset center",
      "Pivot and face front",
      "Reach high then drop low",
    ];

    const strengthCues = hasStrengthSkill
      ? [
          "Drop into two lunges",
          "Two bodyweight squats now",
          "Three push ups then rise",
        ]
      : [];

    const agilityCues = hasAgilitySkill
      ? [
          "Side lunge stretch and hold",
          "Hamstring reach stretch switch",
          "Calf stretch step and hold",
          "Hip opener stretch then reset",
        ]
      : [];

    const cuePool = [...baseCues, ...strengthCues, ...agilityCues];
    if (!cuePool.length) return "Step right and tap";

    const idx = (defaultCueIdxRef.current + randomCueOffsetRef.current) % cuePool.length;
    randomCueOffsetRef.current = (randomCueOffsetRef.current + 3) % cuePool.length;
    const cue = cuePool[idx];
    defaultCueIdxRef.current += 1;
    return cue;
  }, [hasAgilitySkill, hasStrengthSkill]);

  const toggleAudio = useCallback(async () => {
    const win = window as WindowWithWebkitAudio;
    const AudioCtx = globalThis.AudioContext || win.webkitAudioContext;
    if (!audioEnabled) {
      if (!AudioCtx) return;
      console.info("[dance] enable audio -> unlockVoice()");
      unlockVoice();
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioCtx();
      }
      await audioCtxRef.current.resume();
      setAudioEnabled(true);
      return;
    }
    await audioCtxRef.current?.suspend();
    setAudioEnabled(false);
  }, [audioEnabled]);

  useEffect(() => {
    if (!isActive || !audioEnabled) {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }
      return;
    }

    const mode = hasSpeedSkill ? "fast" : "slow";
    const track = new Audio(`/api/dance-track?mode=${mode}`);
    track.preload = "auto";
    track.volume = 0.75;
    track.onended = () => {
      setAudioEnabled(false);
      onNav("worlds");
    };
    musicRef.current = track;
    void track.play().catch(() => undefined);

    return () => {
      track.pause();
      track.currentTime = 0;
      if (musicRef.current === track) {
        musicRef.current = null;
      }
    };
  }, [audioEnabled, hasSpeedSkill, isActive, onNav]);

  const handleMove = useCallback((quality: "perfect" | "good" | "miss") => {
    const pts = { perfect: 100, good: 60, miss: 10 };
    const f = {
      perfect: { text: "PERFECT!", type: "perfect" as const },
      good: { text: "NICE MOVE", type: "good" as const },
      miss: { text: "MISS", type: "miss" as const },
    };
    setFeedback(f[quality]);
    setCombo((c) => {
      const next = quality === "miss" ? 0 : c + 1;
      comboRef.current = next;
      return next;
    });
    setScore((s) => s + pts[quality] * (comboRef.current >= 5 ? 2 : 1));
    onRepRef.current({ stat: "sta", xp: pts[quality] / 10 });
    setTimeout(() => setFeedback(null), 900);
  }, []);

  const requestMoveCue = useCallback(async () => {
    if (cuePendingRef.current) return;
    cuePendingRef.current = true;
    console.info("[dance] requestMoveCue started");
    try {
      const activeSkills = state.activeSkills.length ? state.activeSkills.join(", ") : "none";
      const cueRequest = generateAndSpeakCoachReply("Generate next move cue for this beat.", {
        sessionId: `dance-cue-${world.id}`,
        systemPrompt:
          `You are a dance choreographer for ${world.style}. Active skills: ${activeSkills}. ` +
          `Current BPM is ${bpm}. Keep cues practical for this tempo. ` +
          "Return exactly one short move cue (4-8 words), imperative voice, no punctuation at end, no analysis.",
        interrupt: false,
      });
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Dance cue request timeout")), 8000);
      });
      const { reply } = await Promise.race([cueRequest, timeout]);
      const rawCue = (reply || "").trim();
      const cueWordCount = rawCue ? rawCue.split(/\s+/).length : 0;
      const cue =
        rawCue && cueWordCount >= 2 && cueWordCount <= 10
          ? rawCue
          : getFallbackCue();
      setMoveCue(cue);
      setLastVoice(cue);
      lastCueAtRef.current = Date.now();
    } catch {
      console.info("[dance] requestMoveCue failed -> fallback cue");
      const fallback = getFallbackCue();
      setMoveCue(fallback);
      setLastVoice(fallback);
      speak(fallback, false);
      lastCueAtRef.current = Date.now();
    } finally {
      cuePendingRef.current = false;
    }
  }, [bpm, getFallbackCue, state.activeSkills, world.id, world.style]);

  useEffect(() => {
    if (!isActive) return;
    if (Date.now() - lastCueAtRef.current > 1500) {
      void requestMoveCue();
    }
  }, [isActive, requestMoveCue]);

  useEffect(() => {
    movementRef.current = movement;
  }, [movement]);

  useEffect(() => {
    onRepRef.current = onRep;
  }, [onRep]);

  useEffect(() => {
    if (!isActive) return;
    const beatMs = (60 / bpm) * 1000;
    const id = setInterval(() => {
      setBeat((b) => {
        const nextBeat = b + 1;
        if (nextBeat % 8 === 0 && Date.now() - lastCueAtRef.current > cueIntervalMs) {
          void requestMoveCue();
        }
        return nextBeat;
      });
      if (movementRef.current > 85) handleMove("perfect");
      else if (movementRef.current > 45) handleMove("good");
      else if (movementRef.current > 1) handleMove("miss");
    }, beatMs);
    return () => {
      clearInterval(id);
    };
  }, [audioEnabled, bpm, cueIntervalMs, handleMove, isActive, requestMoveCue]);

  useEffect(() => {
    if (isActive) return;
    const ac = audioCtxRef.current;
    if (ac && ac.state === "running") {
      void ac.suspend();
    }
  }, [isActive]);

  return (
    <div className="p-6 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <button className="btn btn-ghost px-4 py-2 text-xs" onClick={() => onNav("worlds")}>
          WORLDS
        </button>
        <div className="text-center">
          <div className="font-display text-[9px] tracking-[0.1em]" style={{ color: world.accent }}>
            {world.style}
          </div>
          <div className="font-display text-base font-black">{world.name}</div>
        </div>
        <button className={`btn px-3 py-2 text-[10px] ${audioEnabled ? "btn-pow" : "btn-ghost"}`} onClick={toggleAudio}>
          {audioEnabled ? "DISABLE AUDIO" : "ENABLE AUDIO"}
        </button>
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
          <PoseCamera
            exerciseName="SQUAT"
            userInjuries={[]}
            targetReps={9999}
            onSetComplete={() => undefined}
            danceMode="flow"
            persona="world-perform"
            skeletonColor={world.accent}
            onFormUpdate={({ movement: m }) => setMovement(m)}
            isActive={isActive}
            autoVoiceCues={false}
          />
        </div>
        <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-3">
          <div className="mb-3 flex justify-center">
            <Dragon size={Math.min(130, 56 + combo * 2)} state={feedback?.type === "perfect" ? "energized" : "idle"} level={state.level} />
          </div>
          <div className="mb-2 text-center font-display text-xs text-[var(--muted)]">BPM {bpm}</div>
          <div className="rounded-lg bg-black/20 p-2 text-center font-display text-[10px] text-[var(--muted)]">
            COACH AUTO-CUE ACTIVE
          </div>
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
          MOVE {moveCue.toUpperCase()}  MOVEMENT {Math.round(movement)}
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
      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface2)] p-3">
        <div className="mb-1 font-display text-[10px] tracking-[0.08em] text-[var(--muted)]">AI CUE</div>
        <div className="text-sm font-semibold text-[var(--white)]">{moveCue}</div>
        <div className="mt-2 font-display text-[10px] tracking-[0.08em] text-[var(--muted)]">COACH RESPONSE</div>
        <div className="text-sm text-[var(--white)]">{lastVoice || "Coach is calling moves automatically."}</div>
      </div>
    </div>
  );
}