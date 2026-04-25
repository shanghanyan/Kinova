export type FitnessExperience = 'never' | 'tried_before' | 'some_experience';

export interface LimitationDraft {
  region: string;
  type: 'old_injury' | 'pain' | 'surgery' | 'joint_issue';
  severity: 'mild' | 'moderate' | 'severe';
  notes: string;
}

export interface OnboardingProfileDraft {
  character_id: string;
  world_id: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  biological_sex: string;
  fitness_experience: FitnessExperience;
  available_equipment: string[];
  days_per_week: number;
  session_length: string;
  primary_goal: string;
  why_starting: string;
  biggest_fear: string;
  has_limitations: boolean;
  limitations_detail: string;
}
