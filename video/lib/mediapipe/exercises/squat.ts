import { ExerciseAnalyzer, FormFeedback, RepPhase } from './types';

export const squatAnalyzer: ExerciseAnalyzer = {
  name: 'Back Squat',
  category: 'lower_body',
  targetMuscles: ['quadriceps', 'glutes', 'hamstrings', 'core'],
  analyzeFrame(angles: any, phase: RepPhase, userInjuries: string[]): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    if (!angles) return feedback;

    let kneeDepthMin = 85;
    if (userInjuries.some((i) => i.includes('knee'))) kneeDepthMin = 95;

    const leftKneeCave = angles.left_knee_x < angles.left_ankle_x - 0.03;
    const rightKneeCave = angles.right_knee_x > angles.right_ankle_x + 0.03;
    if (leftKneeCave) {
      feedback.push({
        type: 'error',
        joint: 'left_knee',
        message: 'Left knee caving in - push it out',
        severity: 'high',
        voiceCue: 'Left knee out',
      });
    }
    if (rightKneeCave) {
      feedback.push({
        type: 'error',
        joint: 'right_knee',
        message: 'Right knee caving in - push it out',
        severity: 'high',
        voiceCue: 'Right knee out',
      });
    }

    if (phase === 'bottom' && angles.left_knee > kneeDepthMin + 15) {
      feedback.push({
        type: 'warning',
        joint: 'knees',
        message: 'Go deeper - hips below parallel',
        severity: 'medium',
        voiceCue: 'Deeper',
      });
    }

    if (angles.trunk_lean < 135) {
      feedback.push({
        type: 'error',
        joint: 'spine',
        message: 'Too much forward lean - chest up',
        severity: 'high',
        voiceCue: 'Chest up',
      });
    }

    const kneeDelta = Math.abs(angles.left_knee - angles.right_knee);
    if (kneeDelta > 12) {
      feedback.push({
        type: 'asymmetry',
        joint: 'knees',
        message: `Knee asymmetry: ${kneeDelta.toFixed(0)} deg`,
        severity: 'medium',
        voiceCue: null,
      });
    }

    return feedback;
  },
  scoreRep(_repAngles: any[], feedback: FormFeedback[]): number {
    let score = 100;
    score -= feedback.filter((f) => f.severity === 'high').length * 20;
    score -= feedback.filter((f) => f.severity === 'medium').length * 10;
    return Math.max(0, Math.min(100, score));
  },
  detectPhase(angles: any, prevPhase: RepPhase): RepPhase {
    if (!angles) return prevPhase;
    const avgKnee = (angles.left_knee + angles.right_knee) / 2;
    if (avgKnee < 110) return 'bottom';
    if (avgKnee > 155) return 'top';
    return prevPhase === 'bottom' ? 'ascending' : 'descending';
  },
  countRep(phase: RepPhase, prevPhase: RepPhase): boolean {
    return prevPhase === 'ascending' && phase === 'top';
  },
};
