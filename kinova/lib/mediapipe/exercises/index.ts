import { lungeAnalyzer } from "./lunge";
import { pushupAnalyzer } from "./pushup";
import { squatAnalyzer } from "./squat";

const exercises = {
  SQUAT: squatAnalyzer,
  "PUSH-UP": pushupAnalyzer,
  PUSHUP: pushupAnalyzer,
  LUNGE: lungeAnalyzer,
} as const;

export function getExerciseAnalyzer(name: string) {
  const key = name.trim().toUpperCase();
  return exercises[key as keyof typeof exercises] ?? squatAnalyzer;
}
