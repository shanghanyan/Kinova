import type { FormError } from './exercises/types';

export interface InjuryRiskResult {
  risk: boolean;
  reason: string | null;
}

export function detectInjuryRisk(errors: FormError[], lowScoreStreak: number): InjuryRiskResult {
  const highSeverityCount = errors.filter((e) => e.severity === 'high').length;

  if (errors.some((e) => e.code.includes('injury_risk'))) {
    return { risk: true, reason: 'Direct injury risk flag from analyzer.' };
  }

  if (highSeverityCount >= 2 && lowScoreStreak >= 2) {
    return { risk: true, reason: 'Form is breaking down repeatedly.' };
  }

  return { risk: false, reason: null };
}
