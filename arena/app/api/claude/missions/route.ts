import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { profile, limitations, recentSessions } = await req.json();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: 'You generate daily fitness missions for a beginner. Return ONLY valid JSON.',
    messages: [{ role: 'user', content: `User level: ${profile?.level}. Goal: ${profile?.primary_goal}. Experience: ${profile?.fitness_experience}. Recent sessions: ${recentSessions?.length || 0}. Limitations: ${limitations?.map((l:any)=>l.body_region).join(', ') || 'none'}. Generate 3 daily missions + 1 weekly challenge JSON.` }],
  });

  const first = response.content[0];
  const text = first && first.type === 'text' ? first.text : '{}';
  return NextResponse.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
}
