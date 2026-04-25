import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { limitations } = await req.json();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: 'You are a physical therapist. Generate exercise modifications. Return ONLY valid JSON.',
    messages: [{ role: 'user', content: `Limitations: ${JSON.stringify(limitations)} Return JSON array with body_region, avoid_exercises, modified_exercises, add_exercises, ai_notes.` }],
  });

  const first = response.content[0];
  const text = first && first.type === 'text' ? first.text : '[]';
  return NextResponse.json({ modifications: JSON.parse(text.replace(/```json|```/g, '').trim()) });
}
