'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, XCircle, Trophy } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:3001';

interface Match {
    id: string;
    teamA: string;
    teamB: string;
    time: string;
    event: string;
    timestamp: string;
}

interface MatchResult {
    id: string;
    teamA: string;
    teamB: string;
    scoreA: string;
    scoreB: string;
    event: string;
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

function loadPredictions(): Prediction[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem('vct_predictions') || '[]');
    } catch { return []; }
}

function savePredictions(predictions: Prediction[]) {
    localStorage.setItem('vct_predictions', JSON.stringify(predictions));
}

export default function PredictionsPage() {
    const [upcoming, setUpcoming] = useState<Match[]>([]);
    const [results, setResults] = useState<MatchResult[]>([]);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setPredictions(loadPredictions());

        Promise.all([
            fetch(`${API_BASE}/api/matches/upcoming`).then(r => r.json()).catch(() => ({ matches: [] })),
            fetch(`${API_BASE}/api/matches/results`).then(r => r.json()).catch(() => ({ results: [] }))
        ]).then(([upData, resData]) => {
            setUpcoming(upData.matches || []);
            setResults(resData.results || []);
            setLoading(false);
        });
    }, []);

    const submitPrediction = (matchId: string, teamA: string, teamB: string, event: string, winner: string, score: string) => {
        const existing = predictions.filter(p => p.matchId !== matchId);
        const newPrediction: Prediction = {
            matchId, teamA, teamB, event,
            selectedWinner: winner,
            selectedScore: score,
            timestamp: Date.now()
        };
        const updated = [newPrediction, ...existing];
        setPredictions(updated);
        savePredictions(updated);
    };

    const totalPredictions = predictions.length;
    const score = totalPredictions * 130; // Demo scoring

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-tungsten text-white uppercase tracking-wide">Match Predictions</h1>
                    <p className="text-muted">Lock in your predictions for upcoming matches. Earn points for accuracy.</p>
                </div>
                <div className="flex space-x-6">
                    <div className="text-right">
                        <div className="text-sm text-muted">Your Score</div>
                        <div className="text-2xl font-bold text-bull">{score.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted">Predictions Made</div>
                        <div className="text-2xl font-bold text-white">{totalPredictions}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Upcoming Matches — Prediction Cards */}
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

                {/* Recent Results + Prediction History */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2">
                        Recent Results
                    </h2>

                    {results.slice(0, 5).map((r, i) => {
                        const aWon = parseInt(r.scoreA) > parseInt(r.scoreB);
                        const prediction = predictions.find(p =>
                            (p.teamA === r.teamA && p.teamB === r.teamB) ||
                            (p.teamA === r.teamB && p.teamB === r.teamA)
                        );
                        const correct = prediction && prediction.selectedWinner === (aWon ? r.teamA : r.teamB);

                        return (
                            <div key={i} className="bg-primary border border-border rounded-lg p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-muted">{r.teamA} vs {r.teamB}</span>
                                    {prediction ? (
                                        correct ? (
                                            <span className="text-xs text-bull flex items-center gap-1"><CheckCircle size={12} /> +130 pts</span>
                                        ) : (
                                            <span className="text-xs text-bear flex items-center gap-1"><XCircle size={12} /> 0 pts</span>
                                        )
                                    ) : (
                                        <span className="text-xs text-muted flex items-center gap-1"><Clock size={12} /> No prediction</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-white">
                                        <span className={`font-bold ${aWon ? 'text-bull' : ''}`}>{r.teamA}</span>
                                        <span className="font-tungsten text-lg mx-2">{r.scoreA} - {r.scoreB}</span>
                                        <span className={`font-bold ${!aWon ? 'text-bull' : ''}`}>{r.teamB}</span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-accent mt-2">{r.event}</div>
                            </div>
                        );
                    })}

                    {/* Prediction History */}
                    {predictions.length > 0 && (
                        <>
                            <h2 className="text-2xl font-tungsten tracking-wide text-white border-b border-border pb-2 mt-6">
                                Your Predictions
                            </h2>
                            {predictions.slice(0, 5).map((p, i) => (
                                <div key={i} className="bg-primary border border-border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted">{p.teamA} vs {p.teamB}</span>
                                        <span className="text-xs text-accent"><Trophy size={10} className="inline mr-1" />Predicted</span>
                                    </div>
                                    <div className="text-white text-sm">
                                        Winner: <span className="font-bold text-bull">{p.selectedWinner}</span>
                                        {p.selectedScore && <span className="text-muted ml-2">Score: {p.selectedScore}</span>}
                                    </div>
                                    <div className="text-[10px] text-muted mt-1">{new Date(p.timestamp).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

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
