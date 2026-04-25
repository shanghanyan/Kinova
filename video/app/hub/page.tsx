'use client';
import { WorldBackground } from '@/components/world/WorldBackground';
import { CharacterSprite } from '@/components/character/CharacterSprite';
import { useState } from 'react';

export default function HubPage() {
  const [world] = useState('neon_arcade');
  const [character] = useState('spark');

  return (
    <div className="relative min-h-screen">
      <WorldBackground worldId={world} mouseParallax beatBPM={120} intensity={0.08} />
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-32"><CharacterSprite characterId={character} animation="idle" size={120} /></div>
          <div>
            <div className="font-display text-2xl">SPARK</div>
            <div className="text-text-2">Welcome back! Ready to keep going?</div>
          </div>
        </div>
      </div>
    </div>
  )
}
