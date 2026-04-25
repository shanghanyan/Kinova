'use client';

import { useEffect, useState } from 'react';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { ScorePopup } from './ScorePopup';
import { MoveDisplay } from './MoveDisplay';
import { BeatVisualizer } from './BeatVisualizer';
import { WorldBackground } from '@/components/world/WorldBackground';

const MOVES = [
  { name: 'Bounce Step', direction: 'side-to-side' },
  { name: 'Arm Wave', direction: 'up-down' },
  { name: 'Slide Back', direction: 'forward-back' },
  { name: 'Freestyle', direction: 'freestyle' },
];

export function GridSession() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [moveIndex, setMoveIndex] = useState(0);
  const [lastJudgement, setLastJudgement] = useState<{ label: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS'; xp: number }>({ label: 'GOOD', xp: 15 });
  const [beatOn, setBeatOn] = useState(false);
  const bpm = 128;

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    const beatTimer = setInterval(() => {
      setBeatOn(true);
      setTimeout(() => setBeatOn(false), 100);
    }, (60 / bpm) * 1000);
    const moveTimer = setInterval(() => setMoveIndex((m) => (m + 1) % MOVES.length), 8 * (60 / bpm) * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(beatTimer);
      clearInterval(moveTimer);
    };
  }, []);

  const currentMove = MOVES[moveIndex];

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      <div className="h-14 bg-bg-card/80 backdrop-blur border-b border-border z-20 relative px-4 flex items-center justify-between">
        <div className="font-mono text-2xl">Score: {score}</div>
        <div className="font-mono">🔥 x{combo}</div>
        <div className="font-mono">BPM {bpm} · {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</div>
      </div>

      <div className="relative z-10 grid md:grid-cols-[55%_45%] min-h-[calc(100vh-112px)]">
        <section className="relative bg-black/30 border-r border-border p-4">
          <div className="w-full h-full rounded-2xl bg-black/40 border border-border flex items-center justify-center">
            <ScorePopup label={lastJudgement.label} xp={lastJudgement.xp} />
          </div>
          <div className="absolute right-6 top-6 font-display text-2xl">🔥 x{combo}</div>
        </section>

        <section className="relative p-4 flex items-center justify-center overflow-hidden">
          <WorldBackground worldId="neon_arcade" beatBPM={bpm} intensity={0.45} />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center"><CharacterSprite characterId="nova" animation="dance" size={160} showSpeechBubble speechText="YOU ARE DOING IT!" /></div>
            <MoveDisplay move={currentMove.name} direction={currentMove.direction} />
          </div>
        </section>
      </div>

      <div className="h-14 bg-bg-card/80 backdrop-blur border-t border-border z-20 relative px-4 flex items-center justify-between">
        <div className="h-2 flex-1 rounded-full bg-bg-raised overflow-hidden mr-3"><div className="h-full bg-grid" style={{ width: `${Math.floor(((180 - secondsLeft) / 180) * 100)}%` }} /></div>
        <div className="mr-3">&quot;Arena Flow&quot; · Chill Pop · {bpm} BPM</div>
        <BeatVisualizer active={beatOn} />
        <button
          onClick={() => {
            const roll = Math.random();
            const next = roll > 0.85 ? { label: 'MISS' as const, xp: 0 } : roll > 0.55 ? { label: 'GOOD' as const, xp: 15 } : roll > 0.25 ? { label: 'GREAT' as const, xp: 25 } : { label: 'PERFECT' as const, xp: 40 };
            setLastJudgement(next);
            setScore((s) => s + next.xp);
            setCombo((c) => (next.label === 'MISS' ? 0 : c + 1));
          }}
          className="ml-3 bg-grid text-bg px-4 py-2 rounded-[12px] font-bold"
        >
          SCORE 8-COUNT
        </button>
      </div>
    </main>
  );
}
