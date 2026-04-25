'use client';

import { useState } from 'react';
import { VoiceButton } from '@/components/voice/VoiceButton';

interface Props {
  onSubmit: (text: string) => void;
}

export function MoodCheckin({ onSubmit }: Props) {
  const [text, setText] = useState('');

  return (
    <div className="card space-y-4">
      <div className="text-sm text-text-2 italic">Examples: &quot;I want to go hard&quot;, &quot;something chill vibes&quot;, &quot;I am stressed and need to move&quot;</div>
      <div className="flex items-center gap-3">
        <VoiceButton onTranscript={(t) => { setText(t); onSubmit(t); }} characterColor="#f472b6" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type it instead..." className="flex-1 bg-bg-raised border border-border-2 rounded-[12px] px-3 py-3" />
        <button onClick={() => onSubmit(text)} className="bg-grid text-bg px-4 py-3 rounded-[12px] font-bold">GENERATE</button>
      </div>
    </div>
  );
}
