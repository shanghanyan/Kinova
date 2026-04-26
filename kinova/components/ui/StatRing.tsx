interface StatRingProps {
  value: number;
  max?: number;
  color: string;
  label: string;
  icon: string;
  size?: number;
}

export function StatRing({
  value,
  max = 100,
  color,
  label,
  icon,
  size = 90,
}: StatRingProps) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / max);
  return (
    <div className="stat-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="ring-label">
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span className="ring-val" style={{ color }}>
          {value}
        </span>
        <span style={{ color: "var(--muted)", fontSize: 8 }}>{label}</span>
      </div>
    </div>
  );
}
