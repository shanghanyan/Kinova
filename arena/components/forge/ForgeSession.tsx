'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { WorldBackground } from '@/components/world/WorldBackground';
import { VoiceButton } from '@/components/voice/VoiceButton';
import { RepCounter } from './RepCounter';
import { FormScore } from './FormScore';
import { FormTip } from './FormTip';
import { SetComplete } from './SetComplete';
import { InjuryAlert } from './InjuryAlert';
import { PoseCamera } from './PoseCamera';

// These would come from session/profile context in a real app.
// Centralised here so they're easy to wire up later.
const SESSION_CONFIG = {
  exerciseId: 'squat',
  exerciseLabel: 'BACK SQUAT',
  limitationRegions: ['left_knee', 'lower_back'],
  targetReps: 8,
  totalSets: 3,
} as const;

export function ForgeSession() {
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState(0);
  const [score, setScore] = useState(82);
  const [openSetComplete, setOpenSetComplete] = useState(false);
  const [injuryAlert, setInjuryAlert] = useState(false);
  const [tip, setTip] = useState('Push knees out');
  // Track whether PoseCamera has finished its async setup (camera + model).
  const [cameraReady, setCameraReady] = useState(false);
  // Capture the last completed set's coaching payload so SetComplete can show it.
  const [completedSet, setCompletedSet] = useState<{
    reps: number;
    avgScore: number;
  } | null>(null);

  const { exerciseId, exerciseLabel, limitationRegions, targetReps, totalSets } = SESSION_CONFIG;

  const handleSetComplete = ({ reps: finalReps, avgScore }: { reps: number; avgScore: number }) => {
    setReps(finalReps);
    setScore(Math.round(avgScore));
    setCompletedSet({ reps: finalReps, avgScore: Math.round(avgScore) });
    setOpenSetComplete(true);
  };

  const handleNextSet = () => {
    setOpenSetComplete(false);
    setCompletedSet(null);
    setReps(0);
    setScore(82);
    setCurrentSet((s) => Math.min(s + 1, totalSets));
  };

  const speechText =
    reps === 0
      ? 'Let\'s go! 8 reps!'
      : reps % 3 === 0
      ? 'YES! THAT IS IT!'
      : `${targetReps - reps} more!`;

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="h-14 bg-bg-card/80 backdrop-blur border-b border-border z-20 relative px-4 flex items-center justify-between">
        <Link href="/forge" className="text-text-2 hover:text-text">← Back</Link>
        <div className="font-display">{exerciseLabel}</div>
        <div>Set {currentSet} of {totalSets}</div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid md:grid-cols-[55%_45%] min-h-[calc(100vh-112px)]">
        {/* Camera panel */}
        <section className="relative bg-black/30 border-r border-border p-4 flex items-center justify-center">
          <div className="absolute top-4 left-4 z-10">
            <RepCounter current={reps} target={targetReps} />
          </div>
          <div className="absolute top-4 right-4 z-10">
            <FormScore score={score} />
          </div>

          <div className="w-full h-full rounded-2xl bg-black/40 border border-border overflow-hidden relative">
            {/* Loading overlay — shown until PoseCamera calls onReady */}
            {!cameraReady && (
              <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
                <p className="font-mono text-text-secondary text-sm animate-pulse">
                  Starting camera…
                </p>
              </div>
            )}

            <PoseCamera
              exerciseId={exerciseId}
              limitationRegions={limitationRegions}
              targetReps={targetReps}
              onRepCount={setReps}
              onFormScore={setScore}
              onTip={setTip}
              onRisk={(risk) => {
                // Only open the injury alert when risk is newly detected,
                // not every frame it remains true.
                if (risk) setInjuryAlert(true);
              }}
              onSetComplete={handleSetComplete}
              onReady={() => setCameraReady(true)}
            />
          </div>

          <InjuryAlert
            open={injuryAlert}
            onStop={() => {
              setInjuryAlert(false);
              setOpenSetComplete(true);
            }}
            onContinue={() => setInjuryAlert(false)}
          />
        </section>

        {/* Character / world panel */}
        <section className="relative p-4 flex items-center justify-center overflow-hidden">
          <WorldBackground worldId="neon_arcade" intensity={0.4} />
          <div className="relative z-10">
            <CharacterSprite
              characterId="spark"
              animation="workout_top"
              size={160}
              showSpeechBubble
              speechText={speechText}
            />
          </div>
        </section>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────────── */}
      <div className="h-14 bg-bg-card/80 backdrop-blur border-t border-border z-20 relative px-4 flex items-center justify-between gap-4">
        <RepCounter current={reps} target={targetReps} />
        <FormTip text={tip} />
        <div className="flex items-center gap-2">
          <VoiceButton onTranscript={() => undefined} />
          <button
            onClick={() => setOpenSetComplete(true)}
            className="bg-forge text-bg px-4 py-2 rounded-[12px] font-bold"
          >
            END SET
          </button>
        </div>
      </div>

      {/* ── Set complete modal ───────────────────────────────────────────────── */}
      <SetComplete
        open={openSetComplete}
        setNumber={currentSet}
        reps={completedSet?.reps ?? reps}
        score={completedSet?.avgScore ?? score}
        xp={(completedSet?.reps ?? reps) * 10}
        coaching="That set got cleaner rep by rep. Next set: keep driving knees out and own the top position."
        onNext={handleNextSet}
      />
    </main>
  );
}