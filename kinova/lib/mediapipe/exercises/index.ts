import { lungeAnalyzer } from "./lunge";
import { pushupAnalyzer } from "./pushup";
import { squatAnalyzer } from "./squat";

const exercises = {
  SQUAT: squatAnalyzer,
  "PUSH-UP": pushupAnalyzer,
  LUNGE: lungeAnalyzer,
} as const;

export function getExerciseAnalyzer(name: string) {
  return exercises[name as keyof typeof exercises] ?? squatAnalyzer;
}
