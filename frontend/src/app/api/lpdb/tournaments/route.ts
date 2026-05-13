import { NextRequest, NextResponse } from 'next/server';
import { getLpdbTournaments } from '@/lib/liquipedia';

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '30');
    const tournaments = await getLpdbTournaments(limit);
    return NextResponse.json({ tournaments });
  } catch {
    return NextResponse.json({ tournaments: [] });
  }
}
