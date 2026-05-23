import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { teamName, coinsToInvest, currentPrice } = await req.json();

  if (!teamName || !coinsToInvest || !currentPrice || coinsToInvest <= 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (user.coins < coinsToInvest) {
    return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
  }

  const existing = await prisma.holding.findUnique({
    where: { userId_teamName: { userId, teamName } },
  });

  if (existing) {
    const totalCoins = existing.shares * existing.buyPrice + coinsToInvest;
    const totalShares = existing.shares + coinsToInvest / currentPrice;
    const avgPrice = totalCoins / totalShares;

    const [holding] = await prisma.$transaction([
      prisma.holding.update({
        where: { userId_teamName: { userId, teamName } },
        data: { shares: totalShares, buyPrice: avgPrice },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: coinsToInvest } },
      }),
    ]);
    return NextResponse.json({ holding, coinsRemaining: user.coins - coinsToInvest });
  }

  const shares = coinsToInvest / currentPrice;
  const [holding] = await prisma.$transaction([
    prisma.holding.create({
      data: { userId, teamName, shares, buyPrice: currentPrice },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: coinsToInvest } },
    }),
  ]);

  return NextResponse.json({ holding, coinsRemaining: user.coins - coinsToInvest });
}
