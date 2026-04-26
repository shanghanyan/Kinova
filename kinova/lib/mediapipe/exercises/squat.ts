import type { BodyAngles } from "../angles";
import type { FormFeedback } from "@/lib/types";

export const squatAnalyzer = {
  detectPhase(angles: BodyAngles, prevPhase: string): string {
    const avgKnee = (angles.leftKnee + angles.rightKnee) / 2;
    if (avgKnee < 100) return "down";
    if (avgKnee > 150) return "up";
    return prevPhase;
  },

  analyzeFrame(
    angles: BodyAngles,
    phase: string,
    injuries: string[],
  ): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const avgKnee = (angles.leftKnee + angles.rightKnee) / 2;

    if (phase === "down" && avgKnee > 110) {
      feedback.push({
        message: "Go deeper - aim for 90 degree knee angle",
        severity: "medium",
      });
    }

    if (Math.abs(angles.leftKnee - angles.rightKnee) > 15) {
      feedback.push({
        message: "Keep knees aligned",
        severity: "high",
        voiceCue: "Knees out",
      });
    }

    if (angles.torsoAngle < 60 && !injuries.includes("back")) {
      feedback.push({
        message: "Keep chest up",
        severity: "medium",
        voiceCue: "Chest up",
      });
    }

    return feedback;
  },

  scoreRep(feedback: FormFeedback[]): number {
    let score = 100;
    feedback.forEach((item) => {
      if (item.severity === "high") score -= 20;
      if (item.severity === "medium") score -= 10;
      if (item.severity === "low") score -= 5;
    });
    return Math.max(0, score);
  },
};
