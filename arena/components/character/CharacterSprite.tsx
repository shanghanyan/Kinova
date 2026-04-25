'use client';

import { CHARACTERS } from '@/lib/characters';

type AnimationState = 'idle' | 'workout_top' | 'workout_down' | 'dance' | 'celebrate' | 'talk';

interface Props {
  characterId: string;
  animation: AnimationState;
  size?: number;
  repPhase?: 'top' | 'bottom' | 'descending' | 'ascending';
  showSpeechBubble?: boolean;
  speechText?: string;
}

export function CharacterSprite({ characterId, animation, size = 200, repPhase, showSpeechBubble, speechText }: Props) {
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
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
        <CharacterBody characterId={characterId} animation={animation} repPhase={repPhase} color={character.colors.primary} />
      </div>

      <div className="mt-2 px-3 py-1 rounded-full font-display text-sm" style={{ background: character.colors.primary, color: '#000', boxShadow: `0 0 12px ${character.colors.glow}` }}>
        {character.name}
      </div>
    </div>
  );
}

function CharacterBody({ characterId, animation, repPhase, color }: { characterId: string; animation: string; repPhase?: string; color: string; }) {
  const isSquatting = repPhase === 'bottom';
  const isAscending = repPhase === 'ascending';
  const bodyTranslateY = isSquatting ? 20 : isAscending ? 10 : 0;

  return (
    <div className="relative" style={{ width: 120, height: 200 }}>
      <svg width="120" height="200" viewBox="0 0 120 200">
        <defs>
          <radialGradient id={`glow-${characterId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id={`blur-${characterId}`}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <ellipse cx="60" cy="160" rx="45" ry="30" fill={`url(#glow-${characterId})`} filter={`url(#blur-${characterId})`} style={{ animation: `pulse-glow ${characterId === 'spark' ? '1s' : '2s'} ease-in-out infinite` }} />

        <g style={{ transform: `translateY(${bodyTranslateY * 0.3}px)`, transition: 'transform 0.3s' }}>
          <circle cx="60" cy="28" r="22" fill={color} />
          <circle cx="52" cy="26" r="3" fill="rgba(0,0,0,0.6)" />
          <circle cx="68" cy="26" r="3" fill="rgba(0,0,0,0.6)" />
          <path d="M 50 34 Q 60 42 70 34" stroke="rgba(0,0,0,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        <g style={{ transform: `translateY(${bodyTranslateY * 0.6}px)`, transition: 'transform 0.3s' }}>
          <rect x="40" y="54" width="40" height="50" rx="8" fill={color} />
        </g>

        <g style={{ transform: `translateY(${bodyTranslateY * 0.4}px)`, transition: 'transform 0.3s' }}>
          <rect x="22" y="56" width="16" height="36" rx="8" fill={color} opacity="0.9" style={{ transformOrigin: '30px 56px', transform: animation === 'celebrate' ? 'rotate(-40deg)' : animation === 'dance' ? 'rotate(-20deg)' : 'rotate(8deg)', transition: 'transform 0.5s' }} />
          <rect x="82" y="56" width="16" height="36" rx="8" fill={color} opacity="0.9" style={{ transformOrigin: '90px 56px', transform: animation === 'celebrate' ? 'rotate(40deg)' : animation === 'dance' ? 'rotate(20deg)' : 'rotate(-8deg)', transition: 'transform 0.5s' }} />
        </g>

        <g style={{ transition: 'transform 0.3s' }}>
          <g style={{ transformOrigin: '48px 108px', transform: isSquatting ? 'rotate(-35deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <rect x="40" y="106" width="18" height="45" rx="9" fill={color} opacity="0.85" />
          </g>
          <g style={{ transformOrigin: '72px 108px', transform: isSquatting ? 'rotate(35deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <rect x="62" y="106" width="18" height="45" rx="9" fill={color} opacity="0.85" />
          </g>
          <ellipse cx="49" cy={isSquatting ? 168 : 155} rx="11" ry="6" fill={color} opacity="0.7" style={{ transition: 'all 0.3s' }} />
          <ellipse cx="71" cy={isSquatting ? 168 : 155} rx="11" ry="6" fill={color} opacity="0.7" style={{ transition: 'all 0.3s' }} />
        </g>
      </svg>

      {animation === 'celebrate' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute text-xs font-bold font-mono" style={{ left: `${30 + Math.random() * 40}%`, top: `${20 + Math.random() * 60}%`, color, animation: 'xp-float 1s ease-out forwards', animationDelay: `${i * 0.1}s`, fontSize: '10px' }}>
              ⭐
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
