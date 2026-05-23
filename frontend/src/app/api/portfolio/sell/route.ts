import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { teamName, currentPrice } = await req.json();

  if (!teamName || !currentPrice) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const holding = await prisma.holding.findUnique({
    where: { userId_teamName: { userId, teamName } },
  });
  if (!holding) return NextResponse.json({ error: 'No holding found' }, { status: 404 });

  const saleValue = Math.round(holding.shares * currentPrice);

  await prisma.$transaction([
    prisma.holding.delete({ where: { userId_teamName: { userId, teamName } } }),
    prisma.user.update({ where: { id: userId }, data: { coins: { increment: saleValue } } }),
  ]);

  const pnl = saleValue - Math.round(holding.shares * holding.buyPrice);
  return NextResponse.json({ saleValue, pnl });
}
