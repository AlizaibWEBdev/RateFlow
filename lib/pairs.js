// Which pages exist and which get indexed. Keeping the indexable set curated
// (instead of every one of 25,000+ combinations) concentrates crawl budget and
// link equity on pages people actually search for.

const { currencies, byCode } = require('../data/currencies');

const PROFILED = currencies.map(c => c.code);
const HUBS = ['USD', 'EUR', 'GBP'];
const GULF = ['AED', 'SAR', 'QAR', 'KWD', 'OMR', 'BHD'];
const REMITTANCE = ['INR', 'PKR', 'PHP', 'BDT', 'LKR', 'NPR', 'EGP'];

// Pairs with proven Search Console demand or very high global volume.
// These also get amount pages listed in the sitemap.
const TOP_PAIRS = [
    'AED-USD', 'USD-AED', 'THB-USD', 'USD-THB', 'EUR-GBP', 'GBP-EUR', 'AUD-USD', 'USD-AUD',
    'CLP-USD', 'RUB-USD', 'EUR-AED', 'AED-EUR', 'AED-INR', 'INR-AED', 'USD-MXN', 'MXN-USD',
    'USD-JPY', 'JPY-USD', 'NGN-USD', 'QAR-INR', 'QAR-USD', 'LKR-USD', 'GHS-USD', 'CZK-USD',
    'USD-EUR', 'EUR-USD', 'GBP-USD', 'USD-GBP', 'USD-INR', 'INR-USD', 'USD-PKR', 'PKR-USD',
    'GBP-PKR', 'AED-PKR', 'SAR-PKR', 'SAR-INR', 'GBP-INR', 'EUR-INR', 'USD-CAD', 'CAD-USD',
    'USD-PHP', 'AED-PHP', 'USD-BDT', 'AED-BDT', 'GBP-AED', 'AED-GBP', 'USD-SAR', 'SAR-USD',
    'EUR-PKR', 'USD-NGN', 'USD-CNY', 'CNY-USD', 'USD-TRY', 'USD-ZAR', 'KWD-INR', 'KWD-PKR'
];

const EXTRA_PAIRS = [
    'CAD-INR', 'AUD-INR', 'CAD-PKR', 'AUD-PKR', 'SGD-INR', 'MYR-INR', 'CAD-PHP', 'AUD-NZD',
    'NZD-AUD', 'CAD-AUD', 'AUD-CAD', 'EUR-CHF', 'CHF-EUR', 'EUR-SEK', 'EUR-NOK', 'EUR-DKK',
    'EUR-PLN', 'PLN-EUR', 'EUR-CZK', 'EUR-HUF', 'EUR-TRY', 'EUR-RON', 'GBP-CAD', 'GBP-AUD',
    'EUR-CAD', 'EUR-AUD', 'EUR-JPY', 'GBP-JPY', 'EUR-THB', 'GBP-THB', 'AED-SAR', 'SAR-AED',
    'EUR-SAR', 'EUR-QAR', 'GBP-SAR', 'GBP-QAR', 'EUR-MAD', 'EUR-XOF', 'XOF-EUR', 'EUR-XAF',
    'NPR-INR', 'INR-NPR', 'AED-CAD', 'AED-AUD', 'CNY-INR', 'JPY-INR', 'USD-KRW', 'KRW-USD'
];

function key(from, to) {
    return `${from}-${to}`;
}

const indexable = new Map(); // "AED-USD" -> priority

function add(from, to, priority) {
    if (from === to || !byCode[from] || !byCode[to]) return;
    const k = key(from, to);
    if (!indexable.has(k) || indexable.get(k) < priority) indexable.set(k, priority);
}

// Currencies people mostly convert against the dollar only; EUR/GBP pages for
// them would be near-empty of demand, so we don't index them.
const USD_ONLY = new Set(['CLP', 'COP', 'PEN', 'UYU', 'CRC', 'JMD', 'DOP', 'ARS', 'FJD', 'PGK', 'KHR', 'KZT', 'TWD', 'KRW']);

// Every profiled currency against USD, and against EUR/GBP where there is demand.
for (const code of PROFILED) {
    for (const hub of HUBS) {
        if (hub !== 'USD' && USD_ONLY.has(code)) continue;
        add(code, hub, hub === 'USD' ? 0.7 : 0.6);
        add(hub, code, hub === 'USD' ? 0.7 : 0.6);
    }
}
// Gulf -> South/Southeast Asia remittance corridors (money mostly flows one way).
for (const g of GULF) {
    for (const r of REMITTANCE) add(g, r, 0.6);
    for (const r of ['INR', 'PKR']) add(r, g, 0.5);
}
for (const p of EXTRA_PAIRS) add(...p.split('-'), 0.6);
for (const p of TOP_PAIRS) add(...p.split('-'), 0.9);

const topSet = new Set(TOP_PAIRS);

function isIndexablePair(from, to) {
    return indexable.has(key(from, to));
}

function isTopPair(from, to) {
    return topSet.has(key(from, to));
}

function pairPriority(from, to) {
    return indexable.get(key(from, to)) || 0;
}

function allIndexablePairs() {
    return [...indexable.entries()].map(([k, priority]) => {
        const [from, to] = k.split('-');
        return { from, to, priority };
    });
}

function pairPath(from, to) {
    return `/convert/${from.toLowerCase()}-to-${to.toLowerCase()}`;
}

function amountPath(from, to, amountSlug) {
    return `${pairPath(from, to)}/${amountSlug}`;
}

function currencyPath(code) {
    return `/currency/${code.toLowerCase()}`;
}

// Amounts get scaled up for currencies where 1 unit is worth very little
// (nobody converts 1 Chilean peso, but 10,000 CLP is common).
// Amount pages are only indexed for TOP_PAIRS and these round amounts, so each
// one targets a real query ("100 aed to usd") rather than padding the index.
// "1 AED to USD" is answered by the pair page itself, so 1 is never an amount page.
const BASE_AMOUNTS = [10, 50, 100, 500, 1000, 5000, 10000, 100000];

const TABLE_AMOUNTS = [1, 5, 10, 25, 50, 100, 500, 1000, 5000, 10000];

function scaleFactor(usdPerUnit) {
    if (usdPerUnit < 0.0001) return 10000;
    if (usdPerUnit < 0.001) return 1000;
    if (usdPerUnit < 0.01) return 100;
    if (usdPerUnit < 0.05) return 10;
    return 1;
}

function amountsFor(usdPerUnit) {
    return BASE_AMOUNTS.map(a => a * scaleFactor(usdPerUnit));
}

// The subset shown in conversion tables on pair pages.
function tableAmounts(usdPerUnit) {
    const factor = scaleFactor(usdPerUnit);
    return TABLE_AMOUNTS.map(a => a * factor);
}

function isIndexableAmount(from, to, amount, usdPerUnit) {
    return isTopPair(from, to) && amountsFor(usdPerUnit).includes(amount);
}

// Related pairs used for internal linking.
const POPULAR_TARGETS = ['USD', 'EUR', 'GBP', 'INR', 'PKR', 'AED', 'CAD', 'AUD', 'SAR', 'PHP', 'JPY', 'CNY'];

function relatedPairs(from, to) {
    const out = [];
    const seen = new Set([key(from, to)]);
    const push = (f, t) => {
        const k = key(f, t);
        if (f !== t && !seen.has(k) && isIndexablePair(f, t)) {
            seen.add(k);
            out.push({ from: f, to: t });
        }
    };
    push(to, from);
    for (const t of POPULAR_TARGETS) push(from, t);
    for (const f of POPULAR_TARGETS) push(f, to);
    for (const t of POPULAR_TARGETS) push(to, t);
    return out.slice(0, 18);
}

function pairsForCurrency(code) {
    return allIndexablePairs()
        .filter(p => p.from === code || p.to === code)
        .sort((a, b) => b.priority - a.priority || (a.from + a.to).localeCompare(b.from + b.to));
}

module.exports = {
    PROFILED, HUBS, POPULAR_TARGETS, TOP_PAIRS,
    isIndexablePair, isTopPair, pairPriority, allIndexablePairs,
    pairPath, amountPath, currencyPath,
    amountsFor, tableAmounts, isIndexableAmount,
    relatedPairs, pairsForCurrency
};
