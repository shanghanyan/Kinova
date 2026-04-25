'use client';

interface Props {
  amount: number;
  perfect?: boolean;
}

export function XPParticle({ amount, perfect = false }: Props) {
  return (
    <div
      className="font-mono font-bold pointer-events-none"
      style={{
        color: perfect ? 'var(--xp)' : 'var(--forge)',
        animation: 'xp-float 1s ease-out forwards',
      }}
    >
      +{amount} XP{perfect ? ' ⭐' : ''}
    </div>
  );
}
