// Saves current + 30-day rates to data/rates-snapshot.json. The server falls back
// to this file if the rate APIs are unreachable, so pages never render empty.
// Run with: npm run snapshot

const fs = require('fs');
const { fetchLatest, fetchHistory, SNAPSHOT_FILE } = require('../lib/rates');

(async () => {
    const [latest, history] = await Promise.all([fetchLatest(), fetchHistory()]);
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify({ latest, history }));
    console.log(`Saved ${Object.keys(latest.rates).length} rates (${latest.updated}) and ${history.days.length} history days.`);
})().catch(e => {
    console.error(e);
    process.exit(1);
});
