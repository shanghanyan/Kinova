'use client';

import { AnimatePresence, motion } from 'framer-motion';

export function ScorePopup({ label, xp }: { label: 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS'; xp: number }) {
  const color = label === 'PERFECT' ? 'var(--xp)' : label === 'GREAT' ? 'var(--forge)' : label === 'GOOD' ? 'var(--text)' : 'var(--text-3)';
  return (
    <AnimatePresence>
      <motion.div
        key={`${label}-${xp}`}
        initial={{ opacity: 0, scale: 0.7, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.2 }}
        className="font-display"
        style={{ color, fontSize: label === 'PERFECT' ? '2rem' : label === 'GREAT' ? '1.8rem' : '1.5rem' }}
      >
        {label} {xp > 0 ? `+${xp} XP` : ''}
      </motion.div>
    </AnimatePresence>
  );
}
