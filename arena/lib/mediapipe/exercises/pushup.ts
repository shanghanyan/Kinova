import { ExerciseAnalyzer, FormError, RepPhase } from './types';

export const pushupAnalyzer: ExerciseAnalyzer = {
  name: 'Push-up',
  category: 'upper_body',
  targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
  beginnerTip: 'Hands under shoulders, body in one line, slow and controlled.',
  whyDoIt: 'Push-ups build upper-body pushing strength and trunk control.',
  rotatingTips: ['💡 Elbows at about 45 degrees', '💡 Keep head in line with spine', '💡 Squeeze glutes for stability'],
  analyzeFrame(angles, _phase, limitationRegions): FormError[] {
    if (!angles) return [];
    const errors: FormError[] = [];
    const bodyLineY = (angles.left_shoulder_y + angles.right_shoulder_y + angles.left_ankle_y + angles.right_ankle_y) / 4;
    const hipY = (angles.left_hip_y + angles.right_hip_y) / 2;

    if (hipY > bodyLineY + 0.05) errors.push({ code: 'sagging_hips', severity: 'high', voiceCue: true });
    if (angles.nose_x > (angles.left_shoulder_y + angles.right_shoulder_y) / 2 + 0.06) errors.push({ code: 'forward_neck', severity: 'medium', voiceCue: false });

    const shoulderElbowDelta = Math.abs(angles.left_shoulder - angles.right_shoulder);
    if (shoulderElbowDelta > 75) errors.push({ code: 'elbow_flare', severity: 'medium', voiceCue: true });

    if (limitationRegions.some((r) => r.includes('wrist'))) {
      errors.push({ code: 'wrist_modification_fists', severity: 'low', voiceCue: false });
    }
    return errors;
  },
  detectPhase(angles, prevPhase): RepPhase {
    if (!angles) return prevPhase;
    const elbowAvg = (angles.left_elbow + angles.right_elbow) / 2;
    if (elbowAvg < 90) return 'bottom';
    if (elbowAvg > 150) return 'top';
    if (prevPhase === 'bottom' || prevPhase === 'ascending') return 'ascending';
    return 'descending';
  },
  countRep(phase, prevPhase) {
    return (prevPhase === 'ascending' || prevPhase === 'bottom') && phase === 'top';
  },
  scoreRep(errors) {
    return Math.max(0, 100 - errors.reduce((acc, e) => acc + (e.severity === 'high' ? 20 : e.severity === 'medium' ? 10 : 5), 0));
  },
};
