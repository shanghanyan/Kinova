import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { term, context, character } = await req.json();
  const { CHARACTERS } = await import('@/lib/characters');
  const char = CHARACTERS.find((c) => c.id === character) || CHARACTERS[0];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `${char.personality}\nExplain fitness terms to complete beginners. Keep it under 3 sentences.`,
    messages: [{ role: 'user', content: `Explain "${term}" in context "${context}" with analogy.` }],
  });

  const first = response.content[0];
  return NextResponse.json({ explanation: first && first.type === 'text' ? first.text : '' });
}
