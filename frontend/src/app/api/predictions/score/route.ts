import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { predictionId, scoreAwarded } = await req.json();

  if (!predictionId || scoreAwarded === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const prediction = await prisma.prediction.findFirst({ where: { id: predictionId, userId } });
  if (!prediction) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const score = await prisma.predictionScore.upsert({
    where: { predictionId },
    update: { scoreAwarded },
    create: { predictionId, scoreAwarded },
  });

  return NextResponse.json({ score });
}
