import { ExerciseAnalyzer, FormError, RepPhase } from './types';

export const squatAnalyzer: ExerciseAnalyzer = {
  name: 'Bodyweight Squat',
  category: 'lower_body',
  targetMuscles: ['Quads', 'Glutes', 'Hamstrings', 'Core'],
  beginnerTip: "Imagine you're sitting back into a chair. Keep your weight in your heels.",
  whyDoIt: 'Squats build the foundation of all lower body strength.',
  rotatingTips: [
    '💡 Feet shoulder-width apart, toes slightly out',
    '💡 Push your knees out over your pinky toes',
    '💡 Keep your chest up',
    '💡 Breathe in down, out up',
  ],
  analyzeFrame(angles, phase, limitationRegions): FormError[] {
    if (!angles) return [];
    const errors: FormError[] = [];
    const hasKneeIssue = limitationRegions.some((r) => r.includes('knee'));

    const leftCave = angles.left_knee_x < angles.left_ankle_x - 0.04;
    const rightCave = angles.right_knee_x > angles.right_ankle_x + 0.04;
    if (leftCave) errors.push({ code: 'knee_cave_left', severity: 'high', voiceCue: true });
    if (rightCave) errors.push({ code: 'knee_cave_right', severity: 'high', voiceCue: true });

    const targetDepth = hasKneeIssue ? 100 : 90;
    if (phase === 'bottom') {
      const avgKnee = (angles.left_knee + angles.right_knee) / 2;
      if (avgKnee > targetDepth + 15) errors.push({ code: 'insufficient_depth', severity: 'medium', voiceCue: false });
    }

    if (angles.trunk_lean < 130) errors.push({ code: 'forward_lean', severity: 'high', voiceCue: true });

    const kneeDelta = Math.abs(angles.left_knee - angles.right_knee);
    if (kneeDelta > 15) errors.push({ code: 'hip_hike', severity: 'medium', voiceCue: false });

    return errors;
  },
  detectPhase(angles, prevPhase): RepPhase {
    if (!angles) return prevPhase;
    const avgKnee = (angles.left_knee + angles.right_knee) / 2;
    if (avgKnee < 105) return 'bottom';
    if (avgKnee > 155) return 'top';
    if (prevPhase === 'bottom' || prevPhase === 'ascending') return 'ascending';
    return 'descending';
  },
  countRep(phase, prevPhase) {
    return (prevPhase === 'ascending' || prevPhase === 'bottom') && phase === 'top';
  },
  scoreRep(errors) {
    let score = 100;
    errors.forEach((e) => {
      if (e.severity === 'high') score -= 20;
      if (e.severity === 'medium') score -= 10;
      if (e.severity === 'low') score -= 5;
    });
    return Math.max(0, score);
  },
};
