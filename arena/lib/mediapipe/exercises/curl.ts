import { ExerciseAnalyzer, FormError, RepPhase } from './types';

export const curlAnalyzer: ExerciseAnalyzer = {
  name: 'Bicep Curl',
  category: 'upper_body',
  targetMuscles: ['Biceps', 'Forearms'],
  beginnerTip: 'Keep elbows close to your body and move slowly.',
  whyDoIt: 'Curls build arm pulling strength and elbow control.',
  rotatingTips: ['💡 Elbows pinned near ribs', '💡 No swinging', '💡 Full range, full control'],
  analyzeFrame(angles): FormError[] {
    if (!angles) return [];
    const errors: FormError[] = [];
    const shoulderTravel = Math.abs(angles.left_shoulder_y - angles.right_shoulder_y);
    if (shoulderTravel > 0.05) errors.push({ code: 'shoulder_swing', severity: 'medium', voiceCue: true });
    return errors;
  },
  detectPhase(angles, prevPhase): RepPhase {
    if (!angles) return prevPhase;
    const elbowAvg = (angles.left_elbow + angles.right_elbow) / 2;
    if (elbowAvg < 50) return 'bottom';
    if (elbowAvg > 150) return 'top';
    if (prevPhase === 'bottom' || prevPhase === 'ascending') return 'ascending';
    return 'descending';
  },
  countRep(phase, prevPhase) {
    return (prevPhase === 'ascending' || prevPhase === 'bottom') && phase === 'top';
  },
  scoreRep(errors) {
    return Math.max(0, 100 - errors.length * 15);
  },
};
