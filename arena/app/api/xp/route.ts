import { NextRequest, NextResponse } from 'next/server';
import { calculateLevel } from '@/lib/xp';

export async function POST(req: NextRequest) {
  const { currentXP = 0, awardXP = 0 } = await req.json();
  const updatedXP = currentXP + awardXP;
  const level = calculateLevel(updatedXP);
  return NextResponse.json({ updatedXP, level });
}
