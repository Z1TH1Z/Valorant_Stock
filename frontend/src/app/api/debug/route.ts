import { NextResponse } from 'next/server';

export async function GET() {
  const base = process.env.VLRGG_API_URL ?? 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${base}/match?q=results`, { cache: 'no-store' });
    const data = await res.json();
    const first = data?.data?.segments?.[0] ?? null;
    return NextResponse.json({ base, first_segment: first });
  } catch (e: any) {
    return NextResponse.json({ base, error: e.message });
  }
}
