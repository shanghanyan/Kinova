import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { moodInput, profile, limitations, character } = await req.json();
  const { CHARACTERS } = await import('@/lib/characters');
  const char = CHARACTERS.find((c) => c.id === character) || CHARACTERS[0];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are ${char.name} generating a dance cardio session for a BEGINNER. User mood/request: "${moodInput}". Limitations: ${limitations?.map((l: any) => `${l.body_region} (${l.limitation_type})`).join(', ') || 'none'}. User goal: ${profile?.primary_goal}. Return ONLY valid JSON.`,
    messages: [{ role: 'user', content: 'Generate the choreography JSON exactly as specified.' }],
  });

  const first = response.content[0];
  const text = first && first.type === 'text' ? first.text : '{}';
  try {
    return NextResponse.json({ choreography: JSON.parse(text.replace(/```json|```/g, '').trim()) });
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
