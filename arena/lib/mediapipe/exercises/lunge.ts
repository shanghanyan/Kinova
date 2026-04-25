import { ExerciseAnalyzer, FormError, RepPhase } from './types';

export const lungeAnalyzer: ExerciseAnalyzer = {
  name: 'Reverse Lunge',
  category: 'lower_body',
  targetMuscles: ['Quads', 'Glutes', 'Core'],
  beginnerTip: 'Take a long enough step so your front knee stays stacked over your foot.',
  whyDoIt: 'Lunges train single-leg strength and balance.',
  rotatingTips: ['💡 Step back softly', '💡 Keep chest proud', '💡 Drive through front heel'],
  analyzeFrame(angles): FormError[] {
    if (!angles) return [];
    const errors: FormError[] = [];
    if (angles.left_knee_x > angles.left_ankle_x + 0.06 || angles.right_knee_x > angles.right_ankle_x + 0.06) {
      errors.push({ code: 'front_knee_over_toe', severity: 'medium', voiceCue: true });
    }
    if (angles.trunk_lean < 130) errors.push({ code: 'forward_lean', severity: 'medium', voiceCue: true });
    return errors;
  },
  detectPhase(angles, prevPhase): RepPhase {
    if (!angles) return prevPhase;
    const kneeAvg = (angles.left_knee + angles.right_knee) / 2;
    if (kneeAvg < 100) return 'bottom';
    if (kneeAvg > 155) return 'top';
    if (prevPhase === 'bottom' || prevPhase === 'ascending') return 'ascending';
    return 'descending';
  },
  countRep(phase, prevPhase) {
    return (prevPhase === 'ascending' || prevPhase === 'bottom') && phase === 'top';
  },
  scoreRep(errors) {
    return Math.max(0, 100 - errors.length * 12);
  },
};
