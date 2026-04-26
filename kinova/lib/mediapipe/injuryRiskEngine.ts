export class InjuryRiskEngine {
  private recentScores: number[] = [];
  private maxHistory = 10;

  analyze(formScore: number) {
    this.recentScores.push(formScore);
    if (this.recentScores.length > this.maxHistory) {
      this.recentScores.shift();
    }

    const avgScore =
      this.recentScores.reduce((acc, score) => acc + score, 0) /
      this.recentScores.length;

    if (avgScore < 40) {
      return { riskLevel: "stop" as const, message: "Form breakdown detected" };
    }
    if (avgScore < 60) {
      return { riskLevel: "warning" as const, message: "Form degrading" };
    }
    return { riskLevel: "none" as const, message: "Form looks good" };
  }
}
