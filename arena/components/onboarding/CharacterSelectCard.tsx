import { Character } from '@/lib/characters';
import { CharacterSprite } from '@/components/character/CharacterSprite';

interface Props {
  character: Character;
  selected: boolean;
  onSelect: () => void;
}

export function CharacterSelectCard({ character, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className="card text-left transition-all hover:scale-[1.02]"
      style={{ borderColor: selected ? character.colors.primary : 'var(--border)', borderWidth: selected ? 2 : 1 }}
    >
      <div className="flex items-center gap-4">
        <CharacterSprite characterId={character.id} animation={selected ? 'celebrate' : 'idle'} size={100} />
        <div className="space-y-1">
          <div className="font-display text-xl" style={{ color: character.colors.primary }}>{character.name}</div>
          <div className="text-text-2 text-sm">{character.tagline}</div>
          <div className="text-xs font-bold text-bg inline-block rounded-full px-3 py-1" style={{ background: character.unlockLevel === 1 ? 'var(--xp)' : 'var(--bg-raised)' }}>
            {character.unlockLevel === 1 ? 'START FREE' : `UNLOCK AT LV ${character.unlockLevel}`}
          </div>
        </div>
      </div>
    </button>
  );
}
