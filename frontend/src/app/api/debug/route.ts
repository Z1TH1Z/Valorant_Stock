import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.VLRGG_API_URL ?? 'http://127.0.0.1:8000';
  try {
    const [resultsRes, upcomingRes] = await Promise.all([
      fetch(`${base}/match?q=results`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`${base}/match?q=upcoming`, { cache: 'no-store' }).then(r => r.json()),
    ]);
    return NextResponse.json({
      base,
      results_first: resultsRes?.data?.segments?.[0] ?? null,
      upcoming_first: upcomingRes?.data?.segments?.[0] ?? null,
      upcoming_count: upcomingRes?.data?.segments?.length ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json({ base, error: e.message });
  }
}
