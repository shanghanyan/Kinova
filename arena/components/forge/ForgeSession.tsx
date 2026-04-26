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

export function ForgeSession() {
  const [reps, setReps] = useState(0);
  const [score, setScore] = useState(82);
  const [openSetComplete, setOpenSetComplete] = useState(false);
  const [injuryAlert, setInjuryAlert] = useState(false);
  const targetReps = 8;
  const [tip, setTip] = useState('Push knees out');

  return (
    <main className="min-h-screen bg-bg relative overflow-hidden">
      <div className="h-14 bg-bg-card/80 backdrop-blur border-b border-border z-20 relative px-4 flex items-center justify-between">
        <Link href="/forge" className="text-text-2 hover:text-text">← Back</Link>
        <div className="font-display">BACK SQUAT</div>
        <div>Set 1 of 3</div>
      </div>
      <div className="relative z-10 grid md:grid-cols-[55%_45%] min-h-[calc(100vh-112px)]">
        <section className="relative bg-black/30 border-r border-border p-4 flex items-center justify-center">
          <div className="absolute top-4 left-4"><RepCounter current={reps} target={targetReps} /></div>
          <div className="absolute top-4 right-4"><FormScore score={score} /></div>
          <div className="w-full h-full rounded-2xl bg-black/40 border border-border overflow-hidden relative">
            <PoseCamera
              exerciseId="squat"
              limitationRegions={['left_knee', 'lower_back']}
              targetReps={targetReps}
              onRepCount={setReps}
              onFormScore={setScore}
              onTip={setTip}
              onRisk={setInjuryAlert}
              onSetComplete={({ reps: finalReps, avgScore }) => {
                setReps(finalReps);
                setScore(avgScore);
                setOpenSetComplete(true);
              }}
            />
          </div>
          <InjuryAlert open={injuryAlert} onStop={() => setOpenSetComplete(true)} onContinue={() => setInjuryAlert(false)} />
        </section>
        <section className="relative p-4 flex items-center justify-center overflow-hidden">
          <WorldBackground worldId="neon_arcade" intensity={0.4} />
          <div className="relative z-10"><CharacterSprite characterId="spark" animation="workout_top" size={160} showSpeechBubble speechText={reps % 3 === 0 ? 'YES! THAT IS IT!' : '8 reps, let us go!'} /></div>
        </section>
      </div>
      <div className="h-14 bg-bg-card/80 backdrop-blur border-t border-border z-20 relative px-4 flex items-center justify-between gap-4">
        <RepCounter current={reps} target={targetReps} />
        <FormTip text={tip} />
        <div className="flex items-center gap-2">
          <VoiceButton onTranscript={() => undefined} />
          <button onClick={() => setOpenSetComplete(true)} className="bg-forge text-bg px-4 py-2 rounded-[12px] font-bold">END SET</button>
        </div>
      </div>
      <SetComplete open={openSetComplete} setNumber={1} reps={reps} score={score} xp={reps * 10} coaching="That set got cleaner rep by rep. Next set: keep driving knees out and own the top position." onNext={() => { setOpenSetComplete(false); setReps(0); }} />
    </main>
  );
}
