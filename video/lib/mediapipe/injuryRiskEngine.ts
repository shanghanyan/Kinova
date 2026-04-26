interface InjuryRiskResult {
  riskLevel: 'none' | 'warning' | 'stop';
  risks: string[];
}

export class InjuryRiskEngine {
  private repScores: number[] = [];

  private prevAngles: any = null;

  private prevTimestamp = 0;

  analyze(angles: any, currentRepScore: number, timestamp: number): InjuryRiskResult {
    const risks: string[] = [];
    let riskLevel: 'none' | 'warning' | 'stop' = 'none';

    if (angles) {
      const kneeDelta = Math.abs((angles.left_knee || 0) - (angles.right_knee || 0));
      const shoulderDelta = Math.abs(
        (angles.left_shoulder || 0) - (angles.right_shoulder || 0)
      );
      if (kneeDelta > 15) risks.push(`Knee asymmetry ${kneeDelta.toFixed(0)} deg`);
      if (shoulderDelta > 20) risks.push(`Shoulder asymmetry ${shoulderDelta.toFixed(0)} deg`);
    }

    if (this.prevAngles && angles && timestamp - this.prevTimestamp > 0) {
      const dt = (timestamp - this.prevTimestamp) / 1000;
      const kneeVelocity = Math.abs((angles.left_knee - this.prevAngles.left_knee) / dt);
      if (kneeVelocity > 200) risks.push('Movement too fast - losing control');
    }

    this.repScores.push(currentRepScore);
    if (this.repScores.length >= 3) {
      const firstRep = this.repScores[0];
      const latestRep = this.repScores[this.repScores.length - 1];
      if (firstRep - latestRep > 25) {
        risks.push('Form degrading significantly');
      }
    }

    if (risks.length >= 2) riskLevel = 'stop';
    else if (risks.length === 1) riskLevel = 'warning';

    this.prevAngles = angles;
    this.prevTimestamp = timestamp;

    return { riskLevel, risks };
  }

  resetSet() {
    this.repScores = [];
    this.prevAngles = null;
  }
}
