import { NextResponse } from 'next/server';
import { getLpdbStandings } from '@/lib/liquipedia';

export async function GET(_req: Request, { params }: { params: Promise<{ tournament: string }> }) {
  const { tournament } = await params;
  try {
    const standings = await getLpdbStandings(decodeURIComponent(tournament));
    return NextResponse.json({ tournament, standings });
  } catch {
    return NextResponse.json({ tournament, standings: [] });
  }
}
