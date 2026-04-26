import { ExerciseAnalyzer, FormFeedback, RepPhase } from './types';

export const pushupAnalyzer: ExerciseAnalyzer = {
  name: 'Push-up',
  category: 'upper_push',
  targetMuscles: ['chest', 'triceps', 'shoulders', 'core'],
  analyzeFrame(angles: any): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    if (!angles) return feedback;

    const avgElbow = (angles.left_elbow + angles.right_elbow) / 2;
    if (avgElbow > 80 && avgElbow < 130) {
      feedback.push({
        type: 'warning',
        joint: 'elbows',
        message: 'Keep elbows tracking back, avoid flaring',
        severity: 'medium',
        voiceCue: 'Elbows in',
      });
    }
    if (angles.spine < 145) {
      feedback.push({
        type: 'error',
        joint: 'spine',
        message: 'Hips sagging, brace your core',
        severity: 'high',
        voiceCue: 'Core tight',
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
    const avgElbow = (angles.left_elbow + angles.right_elbow) / 2;
    if (avgElbow < 90) return 'bottom';
    if (avgElbow > 150) return 'top';
    return prevPhase === 'bottom' ? 'ascending' : 'descending';
  },
  countRep(phase: RepPhase, prevPhase: RepPhase): boolean {
    return prevPhase === 'ascending' && phase === 'top';
  },
};
