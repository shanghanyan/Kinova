import type { BodyAngles } from "../angles";
import type { FormFeedback } from "@/lib/types";

export const lungeAnalyzer = {
  detectPhase(angles: BodyAngles, prevPhase: string): string {
    const knee = Math.min(angles.leftKnee, angles.rightKnee);
    if (knee < 100) return "down";
    if (knee > 155) return "up";
    return prevPhase;
  },
  analyzeFrame(): FormFeedback[] {
    return [];
  },
  scoreRep(): number {
    return 85;
  },
};
