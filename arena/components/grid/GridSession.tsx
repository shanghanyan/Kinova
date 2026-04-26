'use client';

import { useEffect, useRef, useState } from 'react';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { ScorePopup } from './ScorePopup';
import { MoveDisplay } from './MoveDisplay';
import { BeatVisualizer } from './BeatVisualizer';
import { WorldBackground } from '@/components/world/WorldBackground';
import { DanceCamera } from './DanceCamera';

const MOVES = [
  { name: 'Bounce Step', direction: 'side-to-side' },
  { name: 'Arm Wave', direction: 'up-down' },
  { name: 'Slide Back', direction: 'forward-back' },
  { name: 'Freestyle', direction: 'freestyle' },
] as const;

const BPM = 128;
const SESSION_SECONDS = 180;

// Map a 0-100 pose score to a judgement label + XP.
function scoreToJudgement(poseScore: number): { label: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS'; xp: number } {
  if (poseScore >= 90) return { label: 'PERFECT', xp: 40 };
  if (poseScore >= 75) return { label: 'GREAT', xp: 25 };
  if (poseScore >= 55) return { label: 'GOOD', xp: 15 };
  return { label: 'MISS', xp: 0 };
}

interface Props {
  // DanceCamera will call this with a 0-100 form score when it has one.
  // GridSession passes this setter down so the camera can drive scoring.
  onPoseScore?: (score: number) => void;
}

export function GridSession({ onPoseScore }: Props = {}) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [moveIndex, setMoveIndex] = useState(0);
  const [lastJudgement, setLastJudgement] = useState<{
    label: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';
    xp: number;
  }>({ label: 'GOOD', xp: 15 });
  const [beatOn, setBeatOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Latest pose score from DanceCamera — read in the 8-count handler.
  const latestPoseScoreRef = useRef<number | null>(null);

  // Called by DanceCamera every frame it has a pose score.
  const handlePoseScore = (poseScore: number) => {
    latestPoseScoreRef.current = poseScore;
    onPoseScore?.(poseScore);
  };

  useEffect(() => {
    const timer = setInterval(
      () => setSecondsLeft((s) => Math.max(0, s - 1)),
      1000
    );
    const beatTimer = setInterval(() => {
      setBeatOn(true);
      setTimeout(() => setBeatOn(false), 100);
    }, (60 / BPM) * 1000);
    const moveTimer = setInterval(
      () => setMoveIndex((m) => (m + 1) % MOVES.length),
      8 * (60 / BPM) * 1000
    );

    return () => {
      clearInterval(timer);
      clearInterval(beatTimer);
      clearInterval(moveTimer);
    };
  }, []);

  // Judge the current 8-count using the most recent pose score.
  // Falls back to a mediocre "GOOD" if no pose data is available yet
  // (e.g. camera-only mode or model not loaded).
  const handleScore8Count = () => {
    const poseScore = latestPoseScoreRef.current;
    const judgement =
      poseScore !== null
        ? scoreToJudgement(poseScore)
        : { label: 'GOOD' as const, xp: 15 }; // graceful fallback

    setLastJudgement(judgement);
    setScore((s) => s + judgement.xp);
    setCombo((c) => (judgement.label === 'MISS' ? 0 : c + 1));
  };

  const currentMove = MOVES[moveIndex];

  const elapsed = SESSION_SECONDS - secondsLeft;
  const progressPct = Math.floor((elapsed / SESSION_SECONDS) * 100);

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="h-14 bg-bg-card/80 backdrop-blur border-b border-border z-20 relative px-4 flex items-center justify-between">
        <div className="font-mono text-2xl">Score: {score}</div>
        <div className="font-mono">🔥 x{combo}</div>
        <div className="font-mono">
          BPM {BPM} · {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid md:grid-cols-[55%_45%] min-h-[calc(100vh-112px)]">
        {/* Camera panel */}
        <section className="relative bg-black/30 border-r border-border p-4">
          <div className="w-full h-full rounded-2xl bg-black/40 border border-border flex items-center justify-center overflow-hidden relative">
            {/* Camera loading overlay */}
            {!cameraReady && (
              <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
                <p className="font-mono text-text-secondary text-sm animate-pulse">
                  Starting camera…
                </p>
              </div>
            )}

            {/*
              DanceCamera now accepts onPoseScore and onReady.
              See DanceCamera.tsx for the updated interface.
            */}
            <DanceCamera
              onPoseScore={handlePoseScore}
              onReady={() => setCameraReady(true)}
            />

            <ScorePopup label={lastJudgement.label} xp={lastJudgement.xp} />
          </div>
          <div className="absolute right-6 top-6 font-display text-2xl">🔥 x{combo}</div>
        </section>

        {/* Character / world panel */}
        <section className="relative p-4 flex items-center justify-center overflow-hidden">
          <WorldBackground worldId="neon_arcade" beatBPM={BPM} intensity={0.45} />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <CharacterSprite
                characterId="nova"
                animation="dance"
                size={160}
                showSpeechBubble
                speechText="YOU ARE DOING IT!"
              />
            </div>
            <MoveDisplay move={currentMove.name} direction={currentMove.direction} />
          </div>
        </section>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────────── */}
      <div className="h-14 bg-bg-card/80 backdrop-blur border-t border-border z-20 relative px-4 flex items-center justify-between">
        <div className="h-2 flex-1 rounded-full bg-bg-raised overflow-hidden mr-3">
          <div className="h-full bg-grid transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mr-3">&quot;Arena Flow&quot; · Chill Pop · {BPM} BPM</div>
        <BeatVisualizer active={beatOn} />
        <button
          onClick={handleScore8Count}
          className="ml-3 bg-grid text-bg px-4 py-2 rounded-[12px] font-bold"
        >
          SCORE 8-COUNT
        </button>
      </div>
    </main>
  );
}