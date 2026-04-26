export function SkeletonFigure() {
  return (
    <svg width="80" height="180" viewBox="0 0 80 180" fill="none">
      <circle cx="40" cy="16" r="12" stroke="var(--agi)" strokeWidth="2" opacity="0.8" />
      <line x1="40" y1="28" x2="40" y2="90" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="10" y1="42" x2="70" y2="42" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="10" y1="42" x2="4" y2="75" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="4" y1="75" x2="0" y2="105" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="70" y1="42" x2="76" y2="75" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="76" y1="75" x2="80" y2="105" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="24" y1="90" x2="56" y2="90" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="28" y1="90" x2="22" y2="135" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="24" y1="90" x2="56" y2="90" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="22" y1="135" x2="18" y2="175" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="52" y1="90" x2="58" y2="135" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      <line x1="58" y1="135" x2="62" y2="175" stroke="var(--agi)" strokeWidth="2" opacity="0.6" />
      {[
        [10, 42],
        [70, 42],
        [4, 75],
        [76, 75],
        [40, 90],
        [24, 90],
        [56, 90],
        [22, 135],
        [58, 135],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--agi)" opacity="0.9" />
      ))}
    </svg>
  );
}
