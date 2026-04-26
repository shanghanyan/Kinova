import type { BodyAngles } from "../angles";
import type { FormFeedback } from "@/lib/types";

export const pushupAnalyzer = {
  detectPhase(angles: BodyAngles, prevPhase: string): string {
    const avgElbow = (angles.leftElbow + angles.rightElbow) / 2;
    if (avgElbow < 95) return "down";
    if (avgElbow > 155) return "up";
    return prevPhase;
  },
  analyzeFrame(angles: BodyAngles): FormFeedback[] {
    const feedback: FormFeedback[] = [];
    const avgElbow = (angles.leftElbow + angles.rightElbow) / 2;
    const elbowDiff = Math.abs(angles.leftElbow - angles.rightElbow);
    const avgKnee = (angles.leftKnee + angles.rightKnee) / 2;
    const avgHip = (angles.leftHip + angles.rightHip) / 2;

    // Standing or squat-like posture should not be graded as a good push-up.
    if (avgKnee < 150 || avgHip < 145) {
      feedback.push({
        message: "Set a straight plank line before each push-up",
        severity: "high",
        voiceCue: "Get into plank position",
      });
    }

    if (avgElbow > 135) {
      feedback.push({
        message: "Lower your chest more on each rep",
        severity: "medium",
      });
    }

    if (elbowDiff > 18) {
      feedback.push({
        message: "Press evenly through both arms",
        severity: "medium",
      });
    }

    return feedback;
  },
  scoreRep(feedback: FormFeedback[]): number {
    let score = 100;
    feedback.forEach((item) => {
      if (item.severity === "high") score -= 35;
      if (item.severity === "medium") score -= 15;
      if (item.severity === "low") score -= 8;
    });
    return Math.max(0, score);
  },
};
