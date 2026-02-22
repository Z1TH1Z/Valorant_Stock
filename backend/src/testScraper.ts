import { VlrScraperService } from './services/vlrScraper';
import { VCTScoringService } from './services/scoringService';

async function testServices() {
    console.log('--- Testing VLR Rank Scraper (NA) ---');
    const naRankings = await VlrScraperService.scrapeRankings('na');
    console.log(naRankings.slice(0, 3));

    console.log('\n--- Testing Match Result Scraper ---');
    const matches = await VlrScraperService.scrapeResults();
    console.log(matches.slice(0, 3));

    console.log('\n--- Testing Proprietary Scoring Engine ---');
    const samplePlayer1 = { rating: 1.1, acs: 240, kdRatio: 1.2, adr: 150, kast: 78, fkfd: 4, hsPercent: 30 };
    const samplePlayer2 = { rating: 0.9, acs: 180, kdRatio: 0.9, adr: 120, kast: 65, fkfd: -2, hsPercent: 20 };

    const p1Score = VCTScoringService.calculatePlayerScore(samplePlayer1);
    const p2Score = VCTScoringService.calculatePlayerScore(samplePlayer2);
    console.log(`P1 Score: ${p1Score.toFixed(1)}`);
    console.log(`P2 Score: ${p2Score.toFixed(1)}`);

    const teamScore = VCTScoringService.calculateTeamBaseScore([p1Score, p2Score, p1Score, p2Score, p1Score]);
    console.log(`Team Base Score: ${teamScore.toFixed(1)}`);

    const mult = VCTScoringService.getMarginMultiplier(13, 5);
    console.log(`Win impact: ${VCTScoringService.calculateMatchImpact(teamScore, true, mult).toFixed(1)}`);
}

testServices().catch(console.error);
