'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { WorldBackground } from '@/components/world/WorldBackground';
import { getAnalyzer } from '@/lib/mediapipe/exercises';
import { BeginnerGuide } from '@/components/forge/BeginnerGuide';

const ready = [
  { id: 'squat', emoji: '🧱', name: 'Bodyweight Squat', muscles: ['Quads', 'Glutes'], beginner: true, tracked: true },
  { id: 'pushup', emoji: '💥', name: 'Push-up', muscles: ['Chest', 'Triceps'], beginner: true, tracked: true },
  { id: 'lunge', emoji: '🦵', name: 'Reverse Lunge', muscles: ['Glutes', 'Quads'], beginner: true, tracked: true },
  { id: 'curl', emoji: '💪', name: 'Bicep Curl', muscles: ['Biceps'], beginner: true, tracked: true },
  { id: 'plank', emoji: '🧠', name: 'Plank', muscles: ['Core'], beginner: true, tracked: true },
  { id: 'glute_bridge', emoji: '🌉', name: 'Glute Bridge', muscles: ['Glutes', 'Hamstrings'], beginner: true, tracked: true },
];

const comingSoon = ['Romanian Deadlift', 'Overhead Press', 'Bent-over Row', 'Dead Bug', 'Side Plank', 'Step-up', 'Hip Thrust', 'Wall Sit'];

export default function ForgePage() {
  const [selectedId, setSelectedId] = useState<string>('squat');
  const selected = useMemo(() => getAnalyzer(selectedId), [selectedId]);

  return (
    <main className="relative min-h-screen p-6 overflow-hidden">
      <WorldBackground worldId="neon_arcade" intensity={0.25} />
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <h1 className="font-display text-5xl text-forge-gradient">THE FORGE</h1>
        <p className="text-text-2">Today I have got this for you, or pick what you want to work on:</p>

        <div className="grid md:grid-cols-2 gap-4">
          {ready.map((e) => (
            <button key={e.id} onClick={() => setSelectedId(e.id)} className="card text-left hover:scale-[1.01] transition-all" style={{ borderColor: selectedId === e.id ? 'var(--forge)' : 'var(--border)', borderWidth: selectedId === e.id ? 2 : 1 }}>
              <div className="font-display text-2xl">{e.emoji} {e.name}</div>
              <div className="text-sm text-text-2">{e.muscles.join(' · ')}</div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-forge/20 text-forge">Camera tracked ✓</span>
                <span className="px-2 py-1 rounded-full bg-xp/20 text-xp">Beginner ⭐</span>
              </div>
            </button>
          ))}
        </div>

        <BeginnerGuide what={`${selected.name} is a beginner-friendly movement.`} why={selected.whyDoIt} feel="You might feel your muscles working and maybe a little shaky at first." tip={selected.beginnerTip} />

        <div className="card">
          <div className="font-display text-xl mb-2">Coming Soon</div>
          <div className="flex flex-wrap gap-2">{comingSoon.map((name) => <span key={name} className="px-3 py-1 rounded-full bg-bg-raised text-text-3 text-sm">{name}</span>)}</div>
        </div>

        <div className="bg-bg-raised rounded-xl p-3 text-sm text-text-2">New to working out? Start with Squat + Push-up + Plank. That is a full workout.</div>

        <Link href="/forge/session" className="inline-block bg-forge text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px] glow-forge">START THIS EXERCISE →</Link>
      </div>
    </main>
  );
}
