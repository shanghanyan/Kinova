export type DanceGrade = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

export function scoreDanceWindow(matchScore: number): { grade: DanceGrade; xp: number } {
  if (matchScore > 0.85) return { grade: 'PERFECT', xp: 40 };
  if (matchScore > 0.65) return { grade: 'GREAT', xp: 25 };
  if (matchScore > 0.45) return { grade: 'GOOD', xp: 15 };
  return { grade: 'MISS', xp: 0 };
}
