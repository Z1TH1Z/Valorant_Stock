import { NextRequest, NextResponse } from 'next/server';
import { getLpdbTeamHistory } from '@/lib/liquipedia';

export async function GET(req: NextRequest, { params }: { params: Promise<{ teamName: string }> }) {
  const { teamName } = await params;
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20');
    const history = await getLpdbTeamHistory(decodeURIComponent(teamName), limit);
    return NextResponse.json({ team: teamName, history });
  } catch {
    return NextResponse.json({ team: teamName, history: [] });
  }
}
