import { lungeAnalyzer } from './lunge';
import { pushupAnalyzer } from './pushup';
import { squatAnalyzer } from './squat';
import { ExerciseAnalyzer } from './types';

const ANALYZERS: Record<string, ExerciseAnalyzer> = {
  squat: squatAnalyzer,
  'back squat': squatAnalyzer,
  'goblet squat': squatAnalyzer,
  pushup: pushupAnalyzer,
  'push-up': pushupAnalyzer,
  lunge: lungeAnalyzer,
};

export function getExerciseAnalyzer(exerciseName: string): ExerciseAnalyzer {
  const key = exerciseName.toLowerCase().trim();
  return ANALYZERS[key] ?? squatAnalyzer;
}
