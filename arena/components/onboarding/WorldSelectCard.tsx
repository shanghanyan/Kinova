import { World } from '@/lib/worlds';

interface Props {
  world: World;
  selected: boolean;
  onSelect: () => void;
}

export function WorldSelectCard({ world, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`card text-left space-y-3 ${world.unlockLevel > 1 ? 'opacity-70' : ''}`}
      style={{ borderColor: selected ? 'var(--xp)' : 'var(--border)', borderWidth: selected ? 2 : 1 }}
    >
      <div className={`h-24 rounded-xl ${world.bgClass} border border-border`} />
      <div className="font-display text-lg">{world.emoji} {world.name}</div>
      <div className="text-xs text-text-2">{world.unlockLevel === 1 ? 'UNLOCKED' : `Unlock at Level ${world.unlockLevel}`}</div>
    </button>
  );
}
