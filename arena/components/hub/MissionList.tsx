interface Mission {
  id: string;
  emoji: string;
  title: string;
  xp: number;
  current: number;
  target: number;
}

export function MissionList({ missions }: { missions: Mission[] }) {
  return (
    <div className="space-y-3">
      {missions.map((m) => {
        const percent = Math.min(100, Math.floor((m.current / m.target) * 100));
        const done = m.current >= m.target;
        return (
          <div key={m.id} className="card">
            <div className="flex items-center justify-between">
              <div className="font-bold">{m.emoji} {m.title}</div>
              <div className="font-mono text-xp">+{m.xp} XP</div>
            </div>
            <div className="h-2 bg-bg-raised rounded-full mt-2 overflow-hidden"><div className="h-full bg-xp" style={{ width: `${percent}%` }} /></div>
            {done && <div className="text-xs mt-2 text-xp">DONE ✓</div>}
          </div>
        );
      })}
    </div>
  );
}
