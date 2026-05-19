import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getLpdbResults } from '@/lib/liquipedia';

const POINTS_PER_CORRECT = 130;

function teamsMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;

  // Get all user predictions that don't have a score yet
  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { score: true },
  });

  const unresolved = predictions.filter(p => p.score === null);
  if (unresolved.length === 0) return NextResponse.json({ resolved: 0 });

  // Fetch LPDB results to cross-reference
  let lpdbResults: any[] = [];
  try {
    lpdbResults = await getLpdbResults(300);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }

  let resolved = 0;
  for (const prediction of unresolved) {
    const result = lpdbResults.find(r =>
      (teamsMatch(r.team1, prediction.teamA) && teamsMatch(r.team2, prediction.teamB)) ||
      (teamsMatch(r.team1, prediction.teamB) && teamsMatch(r.team2, prediction.teamA))
    );

    if (!result || !result.winner) continue;

    const correct = teamsMatch(result.winner, prediction.selectedWinner);
    await prisma.predictionScore.create({
      data: {
        predictionId: prediction.id,
        scoreAwarded: correct ? POINTS_PER_CORRECT : 0,
      },
    });
    resolved++;
  }

  return NextResponse.json({ resolved });
}
