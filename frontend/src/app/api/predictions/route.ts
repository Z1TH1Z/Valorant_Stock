import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { score: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ predictions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { matchId, teamA, teamB, event, selectedWinner, selectedScore } = await req.json();

  if (!matchId || !teamA || !teamB || !selectedWinner) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existing = await prisma.prediction.findFirst({ where: { userId, matchId } });

  let prediction;
  if (existing) {
    prediction = await prisma.prediction.update({
      where: { id: existing.id },
      data: { selectedWinner, selectedScore: selectedScore ?? '' },
    });
  } else {
    prediction = await prisma.prediction.create({
      data: { userId, matchId, teamA, teamB, event: event ?? '', selectedWinner, selectedScore: selectedScore ?? '' },
    });
  }

  return NextResponse.json({ prediction });
}
