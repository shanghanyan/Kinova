interface Props {
  stats: { label: string; value: string | number }[];
}

export function QuickStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="card text-center">
          <div className="font-mono text-2xl">{s.value}</div>
          <div className="text-xs text-text-2">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
