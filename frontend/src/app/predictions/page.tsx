'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, CheckCircle, Clock, XCircle, Trophy } from 'lucide-react';

const API_BASE = '';
const POINTS_PER_CORRECT = 130;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
    id: string;
    teamA: string;
    teamB: string;
    time: string;
    event: string;
    timestamp: string;
}

interface Prediction {
    matchId: string;
    teamA: string;
    teamB: string;
    event: string;
    selectedWinner: string;
    selectedScore: string;
    timestamp: number;
}

// Shape returned by /api/lpdb/results
interface LpdbMatch {
    id: string;
    date: string;
    team1: string;
    team2: string;
    score1: number;
    score2: number;
    winner: string;   // team name of actual winner
    tournament: string;
}

// Prediction cross-referenced against LPDB — computed in memory, never persisted
interface ResolvedPrediction extends Prediction {
    resolved: boolean;
    correct: boolean;
    pointsEarned: number;
    actualWinner: string;   // empty if not yet resolved
    actualScore: string;    // e.g. "2 - 1", empty if not yet resolved
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadPredictions(): Prediction[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem('vct_predictions') || '[]');
    } catch { return []; }
}

function savePredictions(predictions: Prediction[]) {
    localStorage.setItem('vct_predictions', JSON.stringify(predictions));
}

// ─── Resolution logic ─────────────────────────────────────────────────────────

/** Case-insensitive trim comparison */
function teamsMatch(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Cross-reference stored predictions against LPDB results.
 * Matches by team names (order-independent).
 * Awards POINTS_PER_CORRECT for a correct winner pick, 0 otherwise.
 */
function resolveAgainstLpdb(
    predictions: Prediction[],
    lpdbResults: LpdbMatch[],
): ResolvedPrediction[] {
    return predictions.map((p): ResolvedPrediction => {
        // Find a finished LPDB match for this prediction
        const lpdbMatch = lpdbResults.find(r =>
            (teamsMatch(r.team1, p.teamA) && teamsMatch(r.team2, p.teamB)) ||
            (teamsMatch(r.team1, p.teamB) && teamsMatch(r.team2, p.teamA))
        );

        if (!lpdbMatch || !lpdbMatch.winner) {
            return { ...p, resolved: false, correct: false, pointsEarned: 0, actualWinner: '', actualScore: '' };
        }

        const correct = teamsMatch(lpdbMatch.winner, p.selectedWinner);
        const s1 = lpdbMatch.score1;
        const s2 = lpdbMatch.score2;
        // Normalise score so team1 of the prediction is always first
        const actualScore = teamsMatch(lpdbMatch.team1, p.teamA)
            ? `${s1} - ${s2}`
            : `${s2} - ${s1}`;

        return {
            ...p,
            resolved: true,
            correct,
            pointsEarned: correct ? POINTS_PER_CORRECT : 0,
            actualWinner: lpdbMatch.winner,
            actualScore,
        };
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PredictionsPage() {
    const { data: session } = useSession();
    const [upcoming, setUpcoming] = useState<Match[]>([]);
    const [lpdbResults, setLpdbResults] = useState<LpdbMatch[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPredictions(loadPredictions());

        Promise.all([
            fetch(`${API_BASE}/api/matches/upcoming`)
                .then(r => r.json())
                .catch(() => ({ matches: [] })),
            fetch(`${API_BASE}/api/lpdb/results?limit=200`)
                .then(r => r.json())
                .catch(() => ({ matches: [] })),
        ]).then(([upData, lpdbData]) => {
            setUpcoming(upData.matches || []);
            setLpdbResults(lpdbData.matches || []);
            setLoading(false);
        });
    }, []);

    const submitPrediction = (
        matchId: string, teamA: string, teamB: string,
        event: string, winner: string, score: string,
    ) => {
        const existing = predictions.filter(p => p.matchId !== matchId);
        const newPrediction: Prediction = {
            matchId, teamA, teamB, event,
            selectedWinner: winner,
            selectedScore: score,
            timestamp: Date.now(),
        };
        const updated = [newPrediction, ...existing];
        setPredictions(updated);
        savePredictions(updated);

        // Persist to DB if logged in
        if (session?.user) {
            fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ matchId, teamA, teamB, event, selectedWinner: winner, selectedScore: score }),
            }).catch(() => { /* best-effort */ });
        }
    };

    // Real scores — recomputed whenever predictions or LPDB results change
    const resolved = useMemo(
        () => resolveAgainstLpdb(predictions, lpdbResults),
        [predictions, lpdbResults],
    );

    const totalResolved  = resolved.filter(p => p.resolved).length;
    const totalCorrect   = resolved.filter(p => p.correct).length;
    const score          = totalCorrect * POINTS_PER_CORRECT;
    const accuracy       = totalResolved > 0
        ? Math.round((totalCorrect / totalResolved) * 100)
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">Match Predictions</h1>
                    <p className="text-muted">Lock in your predictions for upcoming matches. Earn points for accuracy.</p>
                </div>
                <div className="flex space-x-6">
                    {accuracy !== null && (
                        <div className="text-right">
                            <div className="text-sm text-muted">Accuracy</div>
                            <div className="text-2xl font-bold text-white">{accuracy}%</div>
                        </div>
                    )}
                    <div className="text-right">
                        <div className="text-sm text-muted">Your Score</div>
                        <div className="text-2xl font-bold text-bull">{score.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted">Predictions</div>
                        <div className="text-2xl font-bold text-white">
                            {totalResolved > 0
                                ? `${totalCorrect}/${totalResolved}`
                                : predictions.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Upcoming Matches */}
                <div className="col-span-2 space-y-6">
                    <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2">
                        Upcoming Matches
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-primary border border-border rounded-lg p-6 animate-pulse">
                                    <div className="h-6 bg-surface rounded w-48 mb-4" />
                                    <div className="h-20 bg-surface rounded mb-4" />
                                    <div className="h-10 bg-surface rounded" />
                                </div>
                            ))}
                        </div>
                    ) : upcoming.length > 0 ? (
                        upcoming.map((match) => (
                            <PredictionCard
                                key={match.id}
                                match={match}
                                existingPrediction={predictions.find(p => p.matchId === match.id)}
                                onSubmit={submitPrediction}
                            />
                        ))
                    ) : (
                        <div className="bg-primary border border-border rounded-lg p-8 text-center">
                            <Clock size={32} className="mx-auto text-muted mb-3" />
                            <p className="text-muted">No upcoming tier 1 matches available for predictions.</p>
                        </div>
                    )}
                </div>

                {/* Results + Prediction History */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2">
                        Recent Results
                    </h2>

                    {/* Show LPDB results, highlighting ones we predicted */}
                    {lpdbResults.slice(0, 8).map((r, i) => {
                        const pred = resolved.find(p =>
                            (teamsMatch(p.teamA, r.team1) && teamsMatch(p.teamB, r.team2)) ||
                            (teamsMatch(p.teamA, r.team2) && teamsMatch(p.teamB, r.team1))
                        );

                        return (
                            <div key={i} className="bg-primary border border-border rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-muted">
                                        {r.team1} vs {r.team2}
                                    </span>
                                    {pred?.resolved ? (
                                        pred.correct ? (
                                            <span className="text-xs text-bull flex items-center gap-1">
                                                <CheckCircle size={12} /> +{POINTS_PER_CORRECT} pts
                                            </span>
                                        ) : (
                                            <span className="text-xs text-bear flex items-center gap-1">
                                                <XCircle size={12} /> 0 pts
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-xs text-muted flex items-center gap-1">
                                            <Clock size={12} /> No prediction
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-white text-sm">
                                        <span className={`font-bold ${teamsMatch(r.winner, r.team1) ? 'text-bull' : ''}`}>
                                            {r.team1}
                                        </span>
                                        <span className="font-tungsten text-lg mx-2">
                                            {r.score1} - {r.score2}
                                        </span>
                                        <span className={`font-bold ${teamsMatch(r.winner, r.team2) ? 'text-bull' : ''}`}>
                                            {r.team2}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-accent mt-2">{r.tournament}</div>
                                <div className="text-[10px] text-muted mt-0.5">
                                    {r.date ? new Date(r.date).toLocaleDateString() : ''}
                                </div>
                            </div>
                        );
                    })}

                    {lpdbResults.length === 0 && !loading && (
                        <div className="bg-primary border border-border rounded-lg p-6 text-center">
                            <p className="text-muted text-sm">No recent results available.</p>
                        </div>
                    )}

                    {/* Prediction History */}
                    {resolved.length > 0 && (
                        <>
                            <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2 mt-6">
                                Your Predictions
                            </h2>
                            {resolved.slice(0, 5).map((p, i) => (
                                <div key={i} className={`bg-primary border rounded-lg p-4 ${
                                    p.resolved
                                        ? p.correct ? 'border-bull/30' : 'border-bear/30'
                                        : 'border-border'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted">{p.teamA} vs {p.teamB}</span>
                                        {p.resolved ? (
                                            p.correct ? (
                                                <span className="text-xs text-bull flex items-center gap-1">
                                                    <CheckCircle size={10} /> +{POINTS_PER_CORRECT} pts
                                                </span>
                                            ) : (
                                                <span className="text-xs text-bear flex items-center gap-1">
                                                    <XCircle size={10} /> Incorrect
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-xs text-accent">
                                                <Trophy size={10} className="inline mr-1" />Pending
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-white text-sm">
                                        Your pick: <span className="font-bold text-bull">{p.selectedWinner}</span>
                                        {p.selectedScore && (
                                            <span className="text-muted ml-2">({p.selectedScore})</span>
                                        )}
                                    </div>
                                    {p.resolved && (
                                        <div className="text-xs text-muted mt-1">
                                            Result: {p.actualWinner} won {p.actualScore}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-muted mt-1">
                                        {new Date(p.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── PredictionCard ───────────────────────────────────────────────────────────

function PredictionCard({ match, existingPrediction, onSubmit }: {
    match: Match;
    existingPrediction?: Prediction;
    onSubmit: (id: string, teamA: string, teamB: string, event: string, winner: string, score: string) => void;
}) {
    const [selectedWinner, setSelectedWinner] = useState(existingPrediction?.selectedWinner || '');
    const [selectedScore, setSelectedScore] = useState(existingPrediction?.selectedScore || '');
    const [submitted, setSubmitted] = useState(!!existingPrediction);

    const scores = ['2 - 0', '2 - 1', '0 - 2', '1 - 2'];

    const handleSubmit = () => {
        if (!selectedWinner) return;
        onSubmit(match.id, match.teamA, match.teamB, match.event, selectedWinner, selectedScore);
        setSubmitted(true);
    };

    return (
        <div className={`bg-primary border rounded-lg overflow-hidden transition-all ${submitted ? 'border-bull/30' : 'border-border hover:border-border-hover'}`}>
            <div className="bg-secondary px-6 py-3 flex justify-between items-center text-sm border-b border-border">
                <span className="text-accent font-medium">{match.event}</span>
                <span className="text-muted flex items-center gap-2"><Clock size={14} /> {match.time}</span>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between gap-8 mb-6">
                    <button
                        onClick={() => { setSelectedWinner(match.teamA); setSubmitted(false); }}
                        className={`flex-1 py-4 px-6 border-2 rounded-lg transition-all flex flex-col items-center
                            ${selectedWinner === match.teamA
                                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5'
                                : 'border-transparent bg-secondary hover:border-border-hover'
                            }`}
                    >
                        <div className="w-14 h-14 bg-surface rounded-lg mb-3 flex items-center justify-center font-tungsten text-xl text-white">
                            {match.teamA.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="font-bold text-sm text-white">{match.teamA}</div>
                    </button>

                    <div className="text-xl font-tungsten text-muted tracking-widest">VS</div>

                    <button
                        onClick={() => { setSelectedWinner(match.teamB); setSubmitted(false); }}
                        className={`flex-1 py-4 px-6 border-2 rounded-lg transition-all flex flex-col items-center
                            ${selectedWinner === match.teamB
                                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5'
                                : 'border-transparent bg-secondary hover:border-border-hover'
                            }`}
                    >
                        <div className="w-14 h-14 bg-surface rounded-lg mb-3 flex items-center justify-center font-tungsten text-xl text-white">
                            {match.teamB.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="font-bold text-sm text-white">{match.teamB}</div>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted mb-3">Series Score (Bo3)</h3>
                        <div className="flex gap-2">
                            {scores.map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setSelectedScore(s); setSubmitted(false); }}
                                    className={`flex-1 py-2 rounded text-sm font-medium transition-colors
                                        ${selectedScore === s
                                            ? 'bg-accent text-white border border-accent'
                                            : 'bg-surface hover:bg-border-hover border border-transparent'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        {submitted ? (
                            <div className="flex items-center gap-2 text-bull text-sm font-medium">
                                <CheckCircle size={18} /> Prediction Locked In!
                            </div>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedWinner}
                                className="px-6 py-2 bg-white text-black font-bold rounded flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <TrendingUp size={18} />
                                Submit Prediction
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
