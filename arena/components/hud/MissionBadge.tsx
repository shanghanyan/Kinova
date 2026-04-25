interface Props {
  emoji: string;
  title: string;
  complete?: boolean;
}

export function MissionBadge({ emoji, title, complete }: Props) {
  return (
    <div className="px-3 py-2 rounded-[12px] border text-xs font-bold" style={{ borderColor: complete ? 'var(--xp)' : 'var(--border-2)', color: complete ? 'var(--xp)' : 'var(--text-2)' }}>
      {emoji} {title} {complete ? '✓' : ''}
    </div>
  );
}
