import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        predictions: {
          select: {
            score: { select: { scoreAwarded: true } },
          },
        },
      },
    });

    const leaderboard = users
      .map(u => {
        const totalScore = u.predictions.reduce(
          (sum, p) => sum + (p.score?.scoreAwarded ?? 0),
          0
        );
        const resolved = u.predictions.filter(p => p.score !== null).length;
        const correct  = u.predictions.filter(p => (p.score?.scoreAwarded ?? 0) > 0).length;
        const accuracy = resolved > 0 ? Math.round((correct / resolved) * 100) : 0;
        return { id: u.id, username: u.username, totalScore, correct, resolved, accuracy };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    return NextResponse.json({ leaderboard });
  } catch {
    return NextResponse.json({ leaderboard: [] });
  }
}
