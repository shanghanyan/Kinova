export type RepPhase = 'top' | 'bottom' | 'descending' | 'ascending';

export interface FormFeedback {
  type: 'error' | 'warning' | 'asymmetry';
  joint: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  voiceCue: string | null;
}

export interface ExerciseAnalyzer {
  name: string;
  category: string;
  targetMuscles: string[];
  analyzeFrame: (angles: any, phase: RepPhase, userInjuries: string[]) => FormFeedback[];
  scoreRep: (repAngles: any[], feedback: FormFeedback[]) => number;
  detectPhase: (angles: any, prevPhase: RepPhase) => RepPhase;
  countRep: (phase: RepPhase, prevPhase: RepPhase) => boolean;
}
