import type { RepPhase } from './exercises/types';

export interface RepCounterState {
  phase: RepPhase;
  reps: number;
}

export function stepRepCounter(nextPhase: RepPhase, state: RepCounterState): RepCounterState {
  const repComplete = (state.phase === 'ascending' || state.phase === 'bottom') && nextPhase === 'top';
  return {
    phase: nextPhase,
    reps: repComplete ? state.reps + 1 : state.reps,
  };
}
