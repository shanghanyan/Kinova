'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PoseCamera, SetData } from '@/components/workout/PoseCamera';
import {
  clearAllPersistedData,
  loadLocalSets,
  persistSet,
  PersistedSet,
} from '@/lib/persistence';

const EXERCISE_MAP: Record<string, string> = {
  'back-squat': 'Back Squat',
  'goblet-squat': 'Goblet Squat',
  lunge: 'Lunge',
  'push-up': 'Push-up',
};

export default function ExerciseWorkoutPage({
  params,
}: {
  params: { exerciseId: string };
}) {
  const exerciseName = useMemo(
    () => EXERCISE_MAP[params.exerciseId] ?? 'Back Squat',
    [params.exerciseId]
  );
  const [history, setHistory] = useState<PersistedSet[]>(() => loadLocalSets());
  const [status, setStatus] = useState<string>('');
  const [targetReps, setTargetReps] = useState(8);
  const [sessionKey, setSessionKey] = useState(0);

  async function handleSetComplete(setData: SetData) {
    const saved = await persistSet({
      exerciseName,
      reps: setData.reps,
      avgFormScore: Number(setData.avgFormScore.toFixed(1)),
      repScores: setData.repScores,
    });
    setHistory((prev) => [saved, ...prev].slice(0, 200));
    setStatus('Set saved. Camera paused for this set.');
  }

  async function handleClearData() {
    await clearAllPersistedData();
    setHistory([]);
    setStatus('Cleared local and Supabase set data.');
  }

  function handleRestart() {
    setSessionKey((k) => k + 1);
    setStatus('');
  }

  return (
    <main className="main-content">
      <div className="w-full max-w-6xl grid lg:grid-cols-[2fr_1fr] gap-4">
        <section className="card min-h-[560px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-2xl">{exerciseName}</h1>
              <p className="text-text-2 text-sm">Live MediaPipe pose detection</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-2">Target reps</label>
              <input
                type="number"
                min={3}
                max={25}
                value={targetReps}
                onChange={(e) => setTargetReps(Number(e.target.value))}
                className="w-20 bg-black/30 border border-white/10 rounded-md px-2 py-1"
              />
              <button
                onClick={handleRestart}
                className="bg-xp text-black rounded-md px-3 py-2 text-sm font-bold"
              >
                Restart Set
              </button>
            </div>
          </div>
          <div className="h-[500px]">
            <PoseCamera
              key={sessionKey}
              exerciseName={exerciseName}
              userInjuries={['left_knee', 'lower_back']}
              targetReps={targetReps}
              onSetComplete={handleSetComplete}
            />
          </div>
          {status && <p className="text-sm text-text-2 mt-3">{status}</p>}
        </section>

        <aside className="card h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Saved Data</h2>
            <button
              onClick={handleClearData}
              className="text-sm border border-red-500/50 text-red-300 rounded-md px-2 py-1 hover:bg-red-500/10"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2 max-h-[480px] overflow-auto">
            {history.length === 0 && (
              <p className="text-sm text-text-2">No saved sets yet. Complete a set to persist data.</p>
            )}
            {history.slice(0, 20).map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-white/10 bg-black/20">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{item.exerciseName}</span>
                  <span className="text-text-2">{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="mt-1 text-sm text-text-2">
                  Reps: {item.reps} | Avg form: {Math.round(item.avgFormScore)}
                </div>
              </div>
            ))}
          </div>
          <Link href="/workout" className="inline-block mt-4 text-sm text-text-2 hover:text-white">
            Back to library
          </Link>
        </aside>
      </div>
    </main>
  );
}
