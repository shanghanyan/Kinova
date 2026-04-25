export type RepPhase = 'top' | 'descending' | 'bottom' | 'ascending';

export interface FormError {
  code: string;
  severity: 'low' | 'medium' | 'high';
  voiceCue: boolean;
}

export interface FrameAnalysis {
  phase: RepPhase;
  errors: FormError[];
  formScore: number;
  repComplete: boolean;
  angles: Record<string, number>;
}

export interface ExerciseAnalyzer {
  name: string;
  category: string;
  targetMuscles: string[];
  beginnerTip: string;
  whyDoIt: string;
  analyzeFrame: (angles: any, phase: RepPhase, limitationRegions: string[]) => FormError[];
  detectPhase: (angles: any, prevPhase: RepPhase) => RepPhase;
  countRep: (phase: RepPhase, prevPhase: RepPhase) => boolean;
  scoreRep: (errors: FormError[]) => number;
  rotatingTips: string[];
}
