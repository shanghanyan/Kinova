import type { ExerciseAnalyzer } from './types';
import { squatAnalyzer } from './squat';
import { pushupAnalyzer } from './pushup';
import { lungeAnalyzer } from './lunge';
import { curlAnalyzer } from './curl';
import { plankAnalyzer } from './plank';
import { gluteBridgeAnalyzer } from './glute_bridge';

const registry: Record<string, ExerciseAnalyzer> = {
  squat: squatAnalyzer,
  pushup: pushupAnalyzer,
  lunge: lungeAnalyzer,
  curl: curlAnalyzer,
  plank: plankAnalyzer,
  glute_bridge: gluteBridgeAnalyzer,
};

export const EXERCISE_ANALYZERS = registry;

export function getAnalyzer(id: string): ExerciseAnalyzer {
  return registry[id] ?? squatAnalyzer;
}
