import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { sessionData, profile, character, conversationHistory } = await req.json();
  const { CHARACTERS } = await import('@/lib/characters');
  const char = CHARACTERS.find((c) => c.id === character) || CHARACTERS[0];

  const summaryRes = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `${char.personality}\nUser memory: ${profile?.ai_memory}\nWrite post-session debrief in character voice.`,
    messages: [{ role: 'user', content: `Session data: ${JSON.stringify(sessionData)}` }],
  });

  const memoryRes = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: 'Update this user memory. Return only updated text max 250 words.',
    messages: [{ role: 'user', content: `Current memory: ${profile?.ai_memory || 'None'} New session: ${JSON.stringify(sessionData)} Things user said: ${(conversationHistory || []).slice(-5).map((c:any)=>c.content).join(' | ')}` }],
  });

  const a = summaryRes.content[0];
  const b = memoryRes.content[0];

  return NextResponse.json({
    debrief: a && a.type === 'text' ? a.text : '',
    updatedMemory: b && b.type === 'text' ? b.text : profile?.ai_memory,
  });
}
