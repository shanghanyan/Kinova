import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { exercise, setNumber, targetReps, repsCompleted, avgFormScore, repScores, formErrors, limitations, character, setHistory } = await req.json();
  const { CHARACTERS } = await import('@/lib/characters');
  const char = CHARACTERS.find((c) => c.id === character) || CHARACTERS[0];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `${char.personality}\n\nExercise: ${exercise} | Set ${setNumber} complete. Target: ${targetReps}. Got: ${repsCompleted}. Form score: ${avgFormScore}/100. Rep scores: ${repScores?.join(', ')}. Form errors: ${formErrors?.join(', ') || 'none'}. Limitations: ${limitations?.map((l: any) => l.body_region).join(', ') || 'none'}. Previous sets: ${JSON.stringify(setHistory?.slice(-2))}`,
    messages: [{ role: 'user', content: 'Give me my between-set coaching note in 2 sentences max.' }],
  });

  const first = response.content[0];
  return NextResponse.json({ coaching: first && first.type === 'text' ? first.text : '' });
}
