interface FeedbackChipProps {
  text: string;
  type: "perfect" | "good" | "fix" | "miss";
}

export function FeedbackChip({ text, type }: FeedbackChipProps) {
  const styles = {
    perfect: { background: "linear-gradient(135deg,var(--xp),var(--pow))", color: "#07090f" },
    good: { background: "var(--success)", color: "#07090f" },
    fix: { background: "rgba(255,95,46,0.15)", color: "var(--pow)" },
    miss: { background: "rgba(255,95,46,0.1)", color: "var(--pow)" },
  } as const;
  return (
    <span className="feedback-chip" style={styles[type]}>
      {text}
    </span>
  );
}
