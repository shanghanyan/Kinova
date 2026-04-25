import { CharacterSprite } from '@/components/character/CharacterSprite';
import { SpeechBubble } from '@/components/character/SpeechBubble';

export function CharacterGreeting({ characterId, message }: { characterId: string; message: string }) {
  return (
    <div className="grid md:grid-cols-[120px_1fr] gap-4 card">
      <div className="flex justify-center md:justify-start"><CharacterSprite characterId={characterId} animation="idle" size={120} /></div>
      <div className="self-center"><SpeechBubble text={message} /></div>
    </div>
  );
}
