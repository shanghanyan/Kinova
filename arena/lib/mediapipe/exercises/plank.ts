import { ExerciseAnalyzer, FormError, RepPhase } from './types';

export const plankAnalyzer: ExerciseAnalyzer = {
  name: 'Plank',
  category: 'core',
  targetMuscles: ['Core', 'Shoulders', 'Glutes'],
  beginnerTip: 'Keep body in a straight line from shoulders to ankles.',
  whyDoIt: 'Planks train anti-collapse core endurance.',
  rotatingTips: ['💡 Breathe slowly', '💡 Squeeze glutes', '💡 Keep neck neutral'],
  analyzeFrame(angles): FormError[] {
    if (!angles) return [];
    const errors: FormError[] = [];
    const baseY = (angles.left_shoulder_y + angles.right_shoulder_y + angles.left_ankle_y + angles.right_ankle_y) / 4;
    const hipY = (angles.left_hip_y + angles.right_hip_y) / 2;

    if (hipY > baseY + 0.05) errors.push({ code: 'hip_sag', severity: 'high', voiceCue: true });
    if (hipY < baseY - 0.05) errors.push({ code: 'pike', severity: 'medium', voiceCue: false });
    if (angles.nose_y > (angles.left_shoulder_y + angles.right_shoulder_y) / 2 + 0.08) errors.push({ code: 'head_drop', severity: 'low', voiceCue: false });
    return errors;
  },
  detectPhase() {
    return 'top';
  },
  countRep() {
    return false;
  },
  scoreRep(errors) {
    return Math.max(0, 100 - errors.reduce((acc, e) => acc + (e.severity === 'high' ? 25 : e.severity === 'medium' ? 12 : 6), 0));
  },
};
