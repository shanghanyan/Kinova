'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LEVEL_TITLES, LEVEL_UNLOCKS } from '@/lib/xp';
import { CharacterSprite } from '@/components/character/CharacterSprite';

interface Props {
  isOpen: boolean;
  newLevel: number;
  characterId: string;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, newLevel, characterId, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const fire = (particleRatio: number, opts: any) => {
      confetti({ origin: { y: 0.6 }, ...opts, particleCount: Math.floor(200 * particleRatio) });
    };
    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, colors: ['#a3e635', '#38bdf8', '#f472b6'] });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }, 300);
  }, [isOpen]);

  const unlocks = LEVEL_UNLOCKS[newLevel] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(4,4,10,0.92)' }}>
          <motion.div initial={{ opacity: 0.8, scale: 1 }} animate={{ opacity: 0, scale: 3 }} transition={{ duration: 0.6 }} className="absolute inset-0" style={{ background: 'radial-gradient(ellipse, rgba(163,230,53,0.4), transparent)' }} />
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.1, stiffness: 200 }} className="card text-center p-10 max-w-sm w-full mx-4 relative">
            <div className="font-display text-sm text-text-2 tracking-widest mb-2">YOU REACHED</div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3, stiffness: 300 }} className="font-display text-7xl font-bold mb-1" style={{ color: 'var(--xp)', textShadow: '0 0 40px var(--xp)' }}>
              {newLevel}
            </motion.div>
            <div className="font-display text-2xl mb-6" style={{ color: 'var(--xp)' }}>{LEVEL_TITLES[newLevel - 1]}</div>
            <div className="flex justify-center mb-6"><CharacterSprite characterId={characterId} animation="celebrate" size={140} /></div>
            {unlocks.length > 0 && (
              <div className="bg-bg-raised rounded-xl p-4 mb-6">
                <div className="text-xs font-body font-bold text-xp uppercase tracking-wider mb-2">🔓 UNLOCKED</div>
                {unlocks.map((u) => (
                  <div key={u.id} className="font-body font-bold text-text">{u.name}</div>
                ))}
              </div>
            )}
            <button onClick={onClose} className="w-full py-4 rounded-xl font-body font-extrabold text-bg text-lg" style={{ background: 'var(--xp)', boxShadow: '0 0 20px var(--xp-glow)' }}>
              LET&apos;S KEEP GOING →
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
