import { NextResponse } from 'next/server';
import { VLR_BASE } from '@/lib/tier1';

export async function GET() {
  try {
    const data = await fetch(`${VLR_BASE}/news`).then(r => r.json());
    const articles = (data?.data?.segments ?? []).slice(0, 10).map((a: any) => ({
      title: a.title || '',
      description: a.description || '',
      date: a.date || '',
      author: a.author || '',
      url: a.url_path ? `https://www.vlr.gg${a.url_path}` : '',
    }));
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
