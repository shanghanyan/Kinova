export class RepCounter {
  private count = 0;
  private phase: "up" | "down" | "transition" = "up";
  private lastPhase = "up";

  update(currentPhase: string): number | null {
    if (currentPhase !== this.lastPhase) {
      if (this.lastPhase === "down" && currentPhase === "up") {
        this.count += 1;
        this.lastPhase = currentPhase;
        this.phase = "up";
        return this.count;
      }
      this.lastPhase = currentPhase;
      this.phase = currentPhase === "down" ? "down" : "transition";
    }
    return null;
  }

  getPhase() {
    return this.phase;
  }

  reset() {
    this.count = 0;
    this.phase = "up";
    this.lastPhase = "up";
  }
}
