import * as cheerio from 'cheerio';

async function testFetch() {
    console.log('Fetching VLR rankings...');
    try {
        const response = await fetch('https://www.vlr.gg/rankings/na', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);

        // Test parsing
        const rankings = [];
        $('.rank-item').each((i, el) => {
            if (i >= 5) return;
            const rank = $(el).find('.rank-item-rank-num').text().trim();
            const teamParts = $(el).find('.rank-item-team-name').text().trim().split('\n');
            const name = teamParts[0]?.trim();
            const points = $(el).find('.rank-item-points').text().trim().replace(' Points', '');
            if (name) rankings.push({ rank, name, points });
        });

        console.log('Parsed Rankings:', rankings);

        console.log('Fetching Matches...');
        const matchResp = await fetch('https://www.vlr.gg/matches/results', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const matchHtml = await matchResp.text();
        const $m = cheerio.load(matchHtml);
        const matches = [];
        $m('.wf-card.match-item').each((i, el) => {
            if (i >= 5) return;
            const teams = $m(el).find('.match-item-vs-team-name');
            const scores = $m(el).find('.match-item-vs-team-score');
            const teamA = teams.eq(0).text().trim();
            const teamB = teams.eq(1).text().trim();
            const scoreA = scores.eq(0).text().trim();
            const scoreB = scores.eq(1).text().trim();
            const event = $m(el).find('.match-item-event').text().trim().split('\n')[0]?.trim();
            if (teamA && teamB) {
                matches.push({ teamA, teamB, scoreA, scoreB, event });
            }
        });
        console.log('Parsed Matches:', matches);
    } catch (err) {
        console.error(err);
    }
}

testFetch();
