'use client';
import React from 'react';
import { CHARACTERS, getCharacter } from '@/lib/characters';

type AnimationState = 'idle' | 'workout_top' | 'workout_down' | 'dance' | 'celebrate' | 'talk';

interface Props { characterId: string; animation: AnimationState; size?: number; repPhase?: 'top'|'bottom'|'descending'|'ascending'; showSpeechBubble?: boolean; speechText?: string }

export function CharacterSprite({ characterId, animation, size = 200, repPhase, showSpeechBubble, speechText }: Props) {
  const character = getCharacter(characterId);
  const scale = size / 200;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size * 1.4 }}>
      {showSpeechBubble && speechText && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 max-w-[200px]" style={{ animation: 'slide-up 0.3s ease-out' }}>
          <div className="bg-white text-black rounded-2xl px-3 py-2 text-sm font-bold font-body text-center leading-tight shadow-xl relative">
            {speechText}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid white' }} />
          </div>
        </div>
      )}

      <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <svg width="120" height="200" viewBox="0 0 120 200">
          <defs>
            <radialGradient id={`glow-${characterId}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={character.colors.primary} stopOpacity="0.3" /><stop offset="100%" stopColor={character.colors.primary} stopOpacity="0" /></radialGradient>
            <filter id={`blur-${characterId}`}><feGaussianBlur stdDeviation="8" /></filter>
          </defs>
          <ellipse cx="60" cy="160" rx="45" ry="30" fill={`url(#glow-${characterId})`} filter={`url(#blur-${characterId})`} style={{ animation: `pulse-glow ${characterId === 'spark' ? '1s' : '2s'} ease-in-out infinite` }} />
          <g style={{ transform: `translateY(0px)`, transition: 'transform 0.3s' }}>
            <circle cx="60" cy="28" r="22" fill={character.colors.primary} />
            <circle cx="52" cy="26" r="3" fill="rgba(0,0,0,0.6)" />
            <circle cx="68" cy="26" r="3" fill="rgba(0,0,0,0.6)" />
            <path d="M 50 34 Q 60 42 70 34" stroke="rgba(0,0,0,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
          <g style={{ transform: `translateY(0px)`, transition: 'transform 0.3s' }}>
            <rect x="40" y="54" width="40" height="50" rx="8" fill={character.colors.primary} />
          </g>
          <g style={{ transform: `translateY(0px)`, transition: 'transform 0.3s' }}>
            <rect x="22" y="56" width="16" height="36" rx="8" fill={character.colors.primary} opacity="0.9" style={{ transformOrigin: '30px 56px', transform: animation === 'celebrate' ? 'rotate(-40deg)' : 'rotate(8deg)', transition: 'transform 0.5s' }} />
            <rect x="82" y="56" width="16" height="36" rx="8" fill={character.colors.primary} opacity="0.9" style={{ transformOrigin: '90px 56px', transform: animation === 'celebrate' ? 'rotate(40deg)' : 'rotate(-8deg)', transition: 'transform 0.5s' }} />
          </g>
          <g>
            <g style={{ transformOrigin: '48px 108px', transform: 'rotate(0deg)', transition: 'transform 0.3s' }}><rect x="40" y="106" width="18" height="45" rx="9" fill={character.colors.primary} opacity="0.85" /></g>
            <g style={{ transformOrigin: '72px 108px', transform: 'rotate(0deg)', transition: 'transform 0.3s' }}><rect x="62" y="106" width="18" height="45" rx="9" fill={character.colors.primary} opacity="0.85" /></g>
            <ellipse cx="49" cy={155} rx="11" ry="6" fill={character.colors.primary} opacity="0.7" style={{ transition: 'all 0.3s' }} />
            <ellipse cx="71" cy={155} rx="11" ry="6" fill={character.colors.primary} opacity="0.7" style={{ transition: 'all 0.3s' }} />
          </g>
        </svg>
      </div>

      <div className="mt-2 px-3 py-1 rounded-full font-display text-sm" style={{ background: character.colors.primary, color: '#000', boxShadow: `0 0 12px ${character.colors.glow}` }}>{character.name}</div>
    </div>
  );
}
