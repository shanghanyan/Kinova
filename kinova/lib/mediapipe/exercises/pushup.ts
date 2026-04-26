import type { BodyAngles } from "../angles";
import type { FormFeedback } from "@/lib/types";

export const pushupAnalyzer = {
  detectPhase(angles: BodyAngles, prevPhase: string): string {
    const avgElbow = (angles.leftElbow + angles.rightElbow) / 2;
    if (avgElbow < 95) return "down";
    if (avgElbow > 155) return "up";
    return prevPhase;
  },
  analyzeFrame(): FormFeedback[] {
    return [];
  },
  scoreRep(): number {
    return 85;
  },
};
