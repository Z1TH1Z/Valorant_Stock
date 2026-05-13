import { NextResponse } from 'next/server';
import { VLR_BASE } from '@/lib/tier1';

export async function GET() {
  try {
    const data = await fetch(`${VLR_BASE}/v2/events?q=upcoming`).then(r => r.json());
    const events = (data?.data?.segments ?? []).map((e: any) => ({
      title: e.title || '',
      status: e.status || '',
      prize: e.prize || '',
      dates: e.dates || '',
      region: e.region || '',
      thumb: e.thumb || '',
      url: e.url_path || '',
    }));
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
