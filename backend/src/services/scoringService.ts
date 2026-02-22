/**
 * vctScoringService.ts
 * Implements the core proprietary scoring algorithm for VCT Performance Tracker
 * based on PRD specifications.
 */

export class VCTScoringService {
    /**
     * Calculates a player's performance score normalized to 0-1 metrics.
     * PlayerScore = (0.25 × Rating) + (0.20 × ACS_normalized) + (0.15 × KD_normalized) +
     *               (0.15 × ADR_normalized) + (0.10 × KAST_normalized) + 
     *               (0.10 × FKFD_impact) + (0.05 × HS%)
     */
    static calculatePlayerScore(stats: {
        rating: number; // 0.8 to 1.4
        acs: number;    // 150 to 300
        kdRatio: number; // 0.7 to 1.5
        adr: number;    // 100 to 180
        kast: number;   // 60 to 85
        fkfd: number;   // -10 to +10
        hsPercent: number; // 15 to 45
    }): number {

        // Normalize function: (val - min) / (max - min)
        const normalize = (val: number, min: number, max: number) => {
            const clamped = Math.max(min, Math.min(max, val));
            return (clamped - min) / (max - min);
        };

        const rNorm = normalize(stats.rating, 0.8, 1.4);
        const acsNorm = normalize(stats.acs, 150, 300);
        const kdNorm = normalize(stats.kdRatio, 0.7, 1.5);
        const adrNorm = normalize(stats.adr, 100, 180);
        const kastNorm = normalize(stats.kast, 60, 85);
        const fkfdNorm = normalize(stats.fkfd, -10, 10);
        const hsNorm = normalize(stats.hsPercent, 15, 45);

        const score =
            (0.25 * rNorm) +
            (0.20 * acsNorm) +
            (0.15 * kdNorm) +
            (0.15 * adrNorm) +
            (0.10 * kastNorm) +
            (0.10 * fkfdNorm) +
            (0.05 * hsNorm);

        // Score is 0 to 1 scale, multiply by 100 for a nicer "Stock Price" look
        return score * 100;
    }

    /**
     * Calculate Team Base Score based on average of active players
     */
    static calculateTeamBaseScore(playerScores: number[]): number {
        if (playerScores.length === 0) return 0;
        const sum = playerScores.reduce((acc, val) => acc + val, 0);
        return sum / playerScores.length;
    }

    /**
     * Get the Multiplier based on the score margin of the match.
     * e.g. 13-0 is 1.5x, 13-11 is 1.05x.
     */
    static getMarginMultiplier(winningScore: number, losingScore: number): number {
        const margin = Math.abs(winningScore - losingScore);

        if (margin >= 13) return 1.50;
        if (margin === 12) return 1.45;
        if (margin === 11) return 1.40;
        if (margin === 10) return 1.35;
        if (margin === 9) return 1.30;
        if (margin === 8) return 1.25;
        if (margin === 7) return 1.20;
        if (margin === 6) return 1.15;
        if (margin === 5) return 1.10;
        if (margin === 4) return 1.08;
        if (margin === 3) return 1.05;
        if (margin === 2) return 1.02;
        return 1.0;
    }

    /**
     * Impact = TeamBaseScore * Multiplier (Losses are negative and penalized less for close match)
     */
    static calculateMatchImpact(teamBaseScore: number, isWin: boolean, marginMultiplier: number): number {
        if (isWin) {
            return teamBaseScore * marginMultiplier;
        } else {
            // Loss penalty multiplier concept - heavy loss = worse penalty
            const lossPenalty = (marginMultiplier - 1) + 0.8;
            return -(teamBaseScore * lossPenalty);
        }
    }
}
