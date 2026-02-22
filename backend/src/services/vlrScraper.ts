import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export class VlrScraperService {
    /**
     * Scrape Top Teams from VLR.gg Rankings
     * @param region 'na', 'eu', 'ap', 'sa' 
     */
    static async scrapeRankings(region: string = 'na') {
        const url = `https://www.vlr.gg/rankings/${region}`;
        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const content = await page.content();
            const $ = cheerio.load(content);

            const teams: any[] = [];

            $('.rank-item').each((i, el) => {
                // This is a naive selector, will need to be refined based on actual VLR DOM
                if (i >= 15) return; // Top 15 only

                const rank = $(el).find('.rank-item-rank-num').text().trim();
                const name = $(el).find('.rank-item-team-name').text().trim();
                const pointsStr = $(el).find('.rank-item-points').text().trim();
                const vlrTeamUrl = $(el).find('a').attr('href');

                if (name && rank) {
                    teams.push({
                        rank: parseInt(rank, 10),
                        name,
                        points: parseInt(pointsStr.replace(/\D/g, ''), 10) || 0,
                        vlrTeamUrl: vlrTeamUrl ? `https://www.vlr.gg${vlrTeamUrl}` : null
                    });
                }
            });

            return teams;
        } catch (error) {
            console.error(`Error scraping rankings for ${region}:`, error);
            return [];
        } finally {
            await browser.close();
        }
    }

    /**
     * Scrape match results
     */
    static async scrapeResults() {
        const url = `https://www.vlr.gg/matches/results`;
        const browser = await puppeteer.launch({ headless: true });

        try {
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            const content = await page.content();
            const $ = cheerio.load(content);

            const matches: any[] = [];

            $('.wf-card.match-item').each((i, el) => {
                if (i >= 20) return;

                const teamA = $(el).find('.match-item-vs-team-name').eq(0).text().trim();
                const teamB = $(el).find('.match-item-vs-team-name').eq(1).text().trim();
                const scoreA = $(el).find('.match-item-vs-team-score').eq(0).text().trim();
                const scoreB = $(el).find('.match-item-vs-team-score').eq(1).text().trim();
                const event = $(el).find('.match-item-event').text().trim() || 'Unknown Event';

                matches.push({
                    teamA,
                    teamB,
                    scoreA: parseInt(scoreA, 10) || 0,
                    scoreB: parseInt(scoreB, 10) || 0,
                    event
                });
            });

            return matches;
        } catch (error) {
            console.error('Error scraping results:', error);
            return [];
        } finally {
            await browser.close();
        }
    }
}
