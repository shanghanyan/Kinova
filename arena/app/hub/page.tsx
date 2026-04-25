'use client';

import Link from 'next/link';
import { WorldBackground } from '@/components/world/WorldBackground';
import { HUD } from '@/components/hud/HUD';
import { CharacterGreeting } from '@/components/hub/CharacterGreeting';
import { ZoneCard } from '@/components/hub/ZoneCard';
import { MissionList } from '@/components/hub/MissionList';
import { QuickStats } from '@/components/hub/QuickStats';

const missions = [
  { id: 'm1', emoji: '⚔️', title: 'Do 8 squats', xp: 200, current: 4, target: 8 },
  { id: 'm2', emoji: '💃', title: 'Dance for 5 mins', xp: 200, current: 5, target: 5 },
  { id: 'm3', emoji: '🔥', title: 'Complete one session', xp: 200, current: 0, target: 1 },
];

export default function HubPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <WorldBackground worldId="neon_arcade" intensity={0.35} mouseParallax />
      <div className="relative z-10">
        <HUD character="⚡ SPARK" level={7} xp={2340} streak={5} />
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <CharacterGreeting characterId="spark" message="Welcome back! Day 5 streak. You are building something real." />

          <div className="grid md:grid-cols-2 gap-4">
            <ZoneCard href="/forge" icon="⚔️" title="THE FORGE" subtitle="Strength training. Every rep guided." variant="forge" cta="ENTER THE FORGE →" preview="Today: Squats + Push-ups + Lunges (20 min)" />
            <ZoneCard href="/grid" icon="💃" title="THE GRID" subtitle="Dance cardio. Tell us the vibe." variant="grid" cta="ENTER THE GRID →" />
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-2xl text-[var(--xp)]">DAILY MISSIONS</h2>
            <MissionList missions={missions} />
          </section>

          <section className="card">
            <h2 className="font-display text-2xl">THIS WEEK&apos;S CHALLENGE</h2>
            <p className="text-text-2">Complete 5 sessions this week (3/5)</p>
            <div className="h-2 bg-bg-raised rounded-full mt-2 overflow-hidden"><div className="h-full bg-xp w-[60%]" /></div>
            <div className="text-xp font-mono mt-2">+500 XP on completion</div>
          </section>

          <QuickStats stats={[{ label: 'Total Sessions', value: 28 }, { label: 'This Week', value: 3 }, { label: 'Best Streak', value: 12 }, { label: 'Total XP', value: 5800 }]} />

          <section className="card flex items-center justify-between">
            <div>
              <div className="font-display text-xl">You are #14 this week</div>
              <div className="text-text-2 text-sm">1. alex_forge · 2. fitness_nova · 3. zen_master_k</div>
            </div>
            <Link href="/leaderboard" className="text-grid font-bold">SEE FULL LEADERBOARD →</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
