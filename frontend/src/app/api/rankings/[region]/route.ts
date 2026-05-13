import { NextResponse } from 'next/server';
import { getLeagueTeams } from '@/lib/tier1';

export async function GET(_req: Request, { params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  try {
    const teams = await getLeagueTeams(region.toLowerCase());
    return NextResponse.json({ region: region.toLowerCase(), teams });
  } catch {
    return NextResponse.json({ region, teams: [] });
  }
}
