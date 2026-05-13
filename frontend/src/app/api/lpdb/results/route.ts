import { NextRequest, NextResponse } from 'next/server';
import { getLpdbResults } from '@/lib/liquipedia';

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '100');
    const matches = await getLpdbResults(limit);
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] });
  }
}
