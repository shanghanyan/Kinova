'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { WorldBackground } from '@/components/world/WorldBackground';
import { LEVEL_TITLES, xpToNextLevel } from '@/lib/xp';

const formData = [
  { date: 'Apr 10', score: 52 },
  { date: 'Apr 12', score: 58 },
  { date: 'Apr 15', score: 64 },
  { date: 'Apr 18', score: 70 },
  { date: 'Apr 21', score: 74 },
  { date: 'Apr 24', score: 79 },
];

const errorData = [
  { name: 'knee cave', count: 8 },
  { name: 'forward lean', count: 5 },
  { name: 'elbow flare', count: 3 },
];

export default function ProgressPage() {
  const [tab, setTab] = useState<'journey' | 'form' | 'records'>('journey');
  const xp = 5800;
  const level = 7;
  const next = xpToNextLevel(xp);

  const heatmap = useMemo(
    () => Array.from({ length: 35 }).map((_, i) => ({ key: i, intensity: Math.floor(Math.random() * 5) })),
    []
  );

  return (
    <main className="relative min-h-screen p-6 overflow-hidden">
      <WorldBackground worldId="neon_arcade" intensity={0.1} />
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <h1 className="font-display text-5xl">YOUR PROGRESS</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('journey')} className={`px-4 py-2 rounded-[12px] font-bold ${tab === 'journey' ? 'bg-forge text-bg' : 'bg-bg-raised text-text-2'}`}>JOURNEY</button>
          <button onClick={() => setTab('form')} className={`px-4 py-2 rounded-[12px] font-bold ${tab === 'form' ? 'bg-forge text-bg' : 'bg-bg-raised text-text-2'}`}>FORM</button>
          <button onClick={() => setTab('records')} className={`px-4 py-2 rounded-[12px] font-bold ${tab === 'records' ? 'bg-forge text-bg' : 'bg-bg-raised text-text-2'}`}>RECORDS</button>
        </div>

        {tab === 'journey' && (
          <section className="space-y-4">
            <div className="card">
              <div className="font-display text-2xl mb-3">Calendar Heatmap</div>
              <div className="grid grid-cols-7 gap-1 max-w-md">
                {heatmap.map((d) => (
                  <div key={d.key} className="w-5 h-5 rounded-[4px]" style={{ background: d.intensity === 0 ? 'var(--bg-raised)' : `rgba(163,230,53,${0.2 * d.intensity})` }} />
                ))}
              </div>
            </div>
            <div className="card space-y-2">
              <div className="font-display text-2xl">Level {level} - {LEVEL_TITLES[level - 1]}</div>
              <div className="h-3 bg-bg-raised rounded-full overflow-hidden"><div className="h-full bg-xp" style={{ width: `${next.percent}%` }} /></div>
              <div className="font-mono text-sm">{next.current}/{next.needed} to next level</div>
              <div className="text-text-2">What unlocks next: Master title progression</div>
            </div>
            <div className="card">🔥 Current streak: 4 days · Best: 12 days</div>
          </section>
        )}

        {tab === 'form' && (
          <section className="grid lg:grid-cols-2 gap-4">
            <div className="card h-72">
              <div className="font-display text-xl mb-2">Form Score Trend</div>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={formData}>
                  <XAxis dataKey="date" stroke="#9090b8" />
                  <YAxis stroke="#9090b8" domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card h-72">
              <div className="font-display text-xl mb-2">Error Frequency</div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={errorData}>
                  <XAxis dataKey="name" stroke="#9090b8" />
                  <YAxis stroke="#9090b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f472b6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {tab === 'records' && (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['Best squat form score', '88 / 100', 'Apr 24'],
              ['Most reps in one set', '14 reps', 'Apr 22'],
              ['Longest plank', '72 sec', 'Apr 21'],
              ['Dance combo streak', 'x18', 'Apr 20'],
              ['Best XP session', '490 XP', 'Apr 24'],
              ['Total reps ever', '1324', 'Today'],
            ].map((r) => (
              <div key={r[0]} className="card">
                <div className="text-text-2 text-sm">{r[0]}</div>
                <div className="font-mono text-2xl">{r[1]}</div>
                <div className="text-xs text-text-3 mt-1">{r[2]} ✨</div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
