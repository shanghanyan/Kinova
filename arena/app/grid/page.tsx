'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { SpeechBubble } from '@/components/character/SpeechBubble';
import { WorldBackground } from '@/components/world/WorldBackground';
import { MoodCheckin } from '@/components/grid/MoodCheckin';

export default function GridPage() {
  const [plan, setPlan] = useState<{ style: string; bpm: number; duration: string; moves: string[] } | null>(null);

  return (
    <main className="relative min-h-screen p-6 overflow-hidden">
      <WorldBackground worldId="neon_arcade" intensity={0.4} />
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
        <h1 className="font-display text-5xl text-grid-gradient">THE GRID</h1>
        <p className="text-text-2">Dance cardio. Totally personalised. You lead.</p>

        <div className="flex flex-col items-center gap-3">
          <CharacterSprite characterId="nova" animation="idle" size={160} />
          <SpeechBubble text="What are you feeling today? Tell me anything." />
        </div>

        <MoodCheckin onSubmit={(text) => {
          const chill = text.toLowerCase().includes('chill') || text.toLowerCase().includes('destress');
          setPlan({ style: chill ? 'chill-vibes' : 'pop', bpm: chill ? 110 : 128, duration: '5 minutes', moves: chill ? ['Slow Bounce', 'Side Step', 'Freestyle'] : ['Bounce Step', 'Arm Wave', 'Slide Back'] });
        }} />

        {plan && (
          <div className="card text-left space-y-2">
            <div className="font-display text-2xl">Session Preview</div>
            <div>Style: {plan.style}</div>
            <div>BPM: {plan.bpm}</div>
            <div>Duration: {plan.duration}</div>
            <div>Moves: {plan.moves.join(', ')}</div>
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Link href="/grid/session" className="bg-grid text-bg font-body font-extrabold text-sm px-6 py-3 rounded-[12px] glow-grid">LET&apos;S DANCE! →</Link>
          <button onClick={() => setPlan(null)} className="border border-border-2 text-text-2 px-6 py-3 rounded-[12px] font-bold">Different vibe?</button>
        </div>
      </div>
    </main>
  );
}
