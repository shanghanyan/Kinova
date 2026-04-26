import { ExerciseAnalyzer, RepPhase } from './exercises/types';

export class RepCounter {
  private count = 0;

  private phase: RepPhase = 'top';

  update(newPhase: RepPhase, analyzer: ExerciseAnalyzer): number | null {
    const prevPhase = this.phase;
    this.phase = newPhase;

    if (analyzer.countRep(newPhase, prevPhase)) {
      this.count += 1;
      return this.count;
    }
    return null;
  }

  getCount() {
    return this.count;
  }

  getPhase() {
    return this.phase;
  }

  reset() {
    this.count = 0;
    this.phase = 'top';
  }
}
