export interface GameState {
  creature: {
    name: string;
    state: "idle" | "energized" | "evolving";
  };
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  reps: number;
  stats: {
    pow: number;
    agi: number;
    sta: number;
  };
  missions: Mission[];
  activeSkills: string[];
}

export interface Mission {
  icon: string;
  label: string;
  desc: string;
  xp: number;
  done: boolean;
}

export interface SetData {
  reps: number;
  avgFormScore: number;
  repScores: number[];
}

export interface World {
  id: string;
  name: string;
  style: string;
  icon: string;
  desc: string;
  bg: string;
  accent: string;
  minLevel: number;
}

export interface Skill {
  id: string;
  tier: number;
  icon: string;
  name: string;
  desc: string;
  stats: ("pow" | "agi" | "sta")[];
  unlocked: boolean;
  requires: string[];
}

export interface RepEvent {
  rep: number;
  score: number;
  timestamp: number;
}

export interface FormFeedback {
  message: string;
  severity: "low" | "medium" | "high";
  voiceCue?: string;
}
