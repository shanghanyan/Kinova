'use client';

import Link from 'next/link';

const EXERCISES = [
  { id: 'back-squat', name: 'Back Squat', category: 'Lower Body', tracked: true },
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'Lower Body', tracked: true },
  { id: 'lunge', name: 'Lunge', category: 'Lower Body', tracked: true },
  { id: 'push-up', name: 'Push-up', category: 'Upper Push', tracked: true },
  { id: 'bicep-curl', name: 'Bicep Curl', category: 'Upper Pull', tracked: false },
  { id: 'plank', name: 'Plank', category: 'Core', tracked: false },
  { id: 'bent-over-row', name: 'Bent-over Row', category: 'Upper Pull', tracked: false },
  { id: 'glute-bridge', name: 'Glute Bridge', category: 'Mobility', tracked: false },
];

export default function WorkoutPage() {
  return (
    <main className="main-content">
      <div className="w-full max-w-5xl card">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-3xl text-forge-gradient">Exercise Library</h1>
          <Link href="/hub" className="text-text-2 hover:text-white transition-colors">
            Back
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {EXERCISES.map((e) => (
            <Link
              key={e.id}
              href={e.tracked ? `/workout/${e.id}` : '#'}
              className="border border-white/10 rounded-xl p-4 bg-bg-raised hover:bg-bg-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{e.name}</div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    e.tracked
                      ? 'bg-xp/20 text-xp border border-xp/40'
                      : 'bg-white/10 text-text-2 border border-white/10'
                  }`}
                >
                  {e.tracked ? 'Tracked by AI' : 'Coming soon'}
                </span>
              </div>
              <div className="text-sm text-text-2 mt-2">{e.category}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
