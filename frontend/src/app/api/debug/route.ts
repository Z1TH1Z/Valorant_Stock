import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    VLRGG_API_URL: process.env.VLRGG_API_URL ?? 'NOT SET',
    VLR_BASE_RESOLVED: process.env.VLRGG_API_URL ?? 'http://127.0.0.1:8000',
  });
}
