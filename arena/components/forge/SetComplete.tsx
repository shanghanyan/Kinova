'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CharacterSprite } from '@/components/character/CharacterSprite';

interface Props {
  open: boolean;
  setNumber: number;
  reps: number;
  score: number;
  xp: number;
  coaching: string;
  onNext: () => void;
}

export function SetComplete({ open, setNumber, reps, score, xp, coaching, onNext }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="fixed left-0 right-0 bottom-0 z-40 bg-bg-raised rounded-t-3xl p-5 border-t border-border">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="font-display text-3xl">SET {setNumber} COMPLETE!</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="card">{reps} Reps</div>
              <div className="card">{Math.round(score)} Form</div>
              <div className="card text-xp">+{xp} XP</div>
              <div className="card">Clean set!</div>
            </div>
            <div className="grid md:grid-cols-[120px_1fr] gap-4 items-center">
              <CharacterSprite characterId="spark" animation="celebrate" size={120} />
              <div className="card">{coaching}</div>
            </div>
            <button onClick={onNext} className="bg-forge text-bg px-6 py-3 rounded-[12px] font-extrabold">START NEXT SET →</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
