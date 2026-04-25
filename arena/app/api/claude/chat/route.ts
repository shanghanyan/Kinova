import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { userMessage, characterId, context, profile, limitations, conversationHistory } = await req.json();
  const { CHARACTERS } = await import('@/lib/characters');
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  const systemPrompt = `${character.personality}\n\nWHAT YOU KNOW ABOUT THIS USER:\n${profile?.ai_memory || 'This is your first conversation.'}\n\nUSER'S PHYSICAL LIMITATIONS:\n${limitations?.length ? limitations.map((l: any) => `${l.body_region}: ${l.limitation_type} (${l.severity})`).join(', ') : 'None reported'}\n\nUSER'S GOAL: ${profile?.primary_goal}\nWHY THEY STARTED: ${profile?.why_starting || 'Not shared'}\nTHEIR FITNESS FEAR: ${profile?.biggest_fear || 'Not shared'}\nEXPERIENCE LEVEL: ${profile?.fitness_experience}\nCURRENT LEVEL: ${profile?.level} | STREAK: ${profile?.current_streak} days\n\nCONTEXT OF THIS CONVERSATION: ${context}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      ...(conversationHistory || []).slice(-8).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ],
  });

  const first = response.content[0];
  const reply = first && first.type === 'text' ? first.text : '';
  return NextResponse.json({ reply, characterName: character.name });
}
