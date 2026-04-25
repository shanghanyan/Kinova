import { ExerciseAnalyzer, FormError, RepPhase } from './types';

export const gluteBridgeAnalyzer: ExerciseAnalyzer = {
  name: 'Glute Bridge',
  category: 'lower_body',
  targetMuscles: ['Glutes', 'Hamstrings', 'Core'],
  beginnerTip: 'Press through your heels and squeeze glutes at the top.',
  whyDoIt: 'Bridges strengthen the hips in a joint-friendly pattern.',
  rotatingTips: ['💡 Exhale as hips lift', '💡 Keep ribs down', '💡 Knees stay parallel'],
  analyzeFrame(angles): FormError[] {
    if (!angles) return [];
    const errors: FormError[] = [];
    const hipDelta = Math.abs(angles.left_hip_y - angles.right_hip_y);
    if (hipDelta > 0.04) errors.push({ code: 'hip_asymmetry', severity: 'medium', voiceCue: true });
    return errors;
  },
  detectPhase(angles, prevPhase): RepPhase {
    if (!angles) return prevPhase;
    const avgHip = (angles.left_hip + angles.right_hip) / 2;
    if (avgHip < 150) return 'bottom';
    if (avgHip > 170) return 'top';
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
