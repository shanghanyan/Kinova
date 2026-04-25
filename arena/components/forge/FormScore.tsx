export function FormScore({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="px-3 py-2 rounded-[12px] border font-mono font-bold" style={{ borderColor: color, color }}>
      FORM {Math.round(score)}
    </div>
  );
}
