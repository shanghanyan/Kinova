import { ExerciseAnalyzer, FormFeedback, RepPhase } from './types';

export const lungeAnalyzer: ExerciseAnalyzer = {
  name: 'Lunge',
  category: 'lower_body',
  targetMuscles: ['quads', 'glutes', 'hamstrings'],
  analyzeFrame(angles: any): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    if (!angles) return feedback;

    if (angles.left_knee_x > angles.left_ankle_x + 0.05) {
      feedback.push({
        type: 'warning',
        joint: 'left_knee',
        message: 'Front knee drifting too far forward',
        severity: 'medium',
        voiceCue: 'Knee back slightly',
      });
    }

    const asym = Math.abs(angles.left_knee - angles.right_knee);
    if (asym > 15) {
      feedback.push({
        type: 'asymmetry',
        joint: 'knees',
        message: `Lunge asymmetry ${asym.toFixed(0)} deg`,
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
    return Math.max(0, score);
  },
  detectPhase(angles: any, prevPhase: RepPhase): RepPhase {
    if (!angles) return prevPhase;
    const avgKnee = (angles.left_knee + angles.right_knee) / 2;
    if (avgKnee < 100) return 'bottom';
    if (avgKnee > 150) return 'top';
    return prevPhase === 'bottom' ? 'ascending' : 'descending';
  },
  countRep(phase: RepPhase, prevPhase: RepPhase): boolean {
    return prevPhase === 'ascending' && phase === 'top';
  },
};
