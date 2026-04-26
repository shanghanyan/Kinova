import type { BodyAngles } from "../angles";
import type { FormFeedback } from "@/lib/types";

export const lungeAnalyzer = {
  detectPhase(angles: BodyAngles, prevPhase: string): string {
    const knee = Math.min(angles.leftKnee, angles.rightKnee);
    if (knee < 100) return "down";
    if (knee > 155) return "up";
    return prevPhase;
  },
  analyzeFrame(angles: BodyAngles): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const minKnee = Math.min(angles.leftKnee, angles.rightKnee);
    const kneeDiff = Math.abs(angles.leftKnee - angles.rightKnee);
    const avgHip = (angles.leftHip + angles.rightHip) / 2;

    if (minKnee > 118) {
      feedback.push({
        message: "Step longer and lower until front knee nears 90 degrees",
        severity: "medium",
      });
    }

    if (kneeDiff > 26) {
      feedback.push({
        message: "Keep left and right sides balanced",
        severity: "high",
      });
    }

    if (avgHip < 140) {
      feedback.push({
        message: "Keep torso tall and stable through the rep",
        severity: "medium",
      });
    }

    return feedback;
  },
  scoreRep(feedback: FormFeedback[]): number {
    let score = 100;
    feedback.forEach((item) => {
      if (item.severity === "high") score -= 22;
      if (item.severity === "medium") score -= 10;
      if (item.severity === "low") score -= 5;
    });
    return Math.max(0, score);
  },
};
