const users = [
  { rank: 1, name: 'alex_forge', character: '🤖', level: 12, xp: 2840 },
  { rank: 2, name: 'fitness_nova', character: '🌟', level: 9, xp: 2210 },
  { rank: 3, name: 'zen_master_k', character: '🌊', level: 8, xp: 1990 },
  { rank: 14, name: 'jamie_arena', character: '⚡', level: 6, xp: 1080 },
];

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="font-display text-5xl">LEADERBOARD</h1>
      <div className="card space-y-2">
        {users.map((u) => (
          <div key={u.rank} className="flex items-center justify-between p-3 rounded-[12px] bg-bg-raised">
            <div className="font-mono">#{u.rank}</div>
            <div className="flex-1 px-3">{u.character} {u.name}</div>
            <div className="text-text-2 text-sm">Lv.{u.level}</div>
            <div className="font-mono text-xp">{u.xp} XP</div>
          </div>
        ))}
      </div>
    </main>
  );
}
