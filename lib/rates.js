// Server-side exchange rates so every page ships real numbers in its HTML.
// Latest rates: ExchangeRate-API open endpoint (160+ currencies, USD base, daily).
// History: ECB reference rates via Frankfurter, extended to pegged currencies.

const path = require('path');
const fs = require('fs');
const { byCode } = require('../data/currencies');

const LATEST_TTL = 60 * 60 * 1000;      // 1 hour
const HISTORY_TTL = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_TIMEOUT = 4000;
const HISTORY_DAYS = 30;
const SNAPSHOT_FILE = path.join(__dirname, '..', 'data', 'rates-snapshot.json');

// Currencies that no longer exist or have unreliable feeds — never build pages for them.
const EXCLUDED = new Set(['BGN', 'HRK', 'SLL', 'VEF', 'ZWL', 'XDR']);

let snapshot = null;
try {
    snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
} catch (e) {
    snapshot = null;
}

const cache = {
    latest: snapshot ? { ...snapshot.latest, fetchedAt: 0 } : null,
    history: snapshot ? { ...snapshot.history, fetchedAt: 0 } : null
};

async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    try {
        const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

async function fetchLatest() {
    const key = process.env.EXCHANGERATE_API_KEY;
    const url = key
        ? `https://v6.exchangerate-api.com/v6/${key}/latest/USD`
        : 'https://open.er-api.com/v6/latest/USD';
    const data = await fetchJson(url);
    const rates = data.rates || data.conversion_rates;
    if (data.result !== 'success' || !rates) throw new Error('Bad latest-rates response');
    for (const code of EXCLUDED) delete rates[code];
    return {
        rates,
        updated: new Date(data.time_last_update_unix * 1000).toISOString()
    };
}

function isoDay(d) {
    return d.toISOString().slice(0, 10);
}

async function fetchHistory() {
    const end = new Date();
    const start = new Date(end.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000);
    const data = await fetchJson(`https://api.frankfurter.dev/v1/${isoDay(start)}..?base=USD`);
    if (!data.rates) throw new Error('Bad history response');
    // { "2026-10-01": { EUR: 0.86, ... }, ... } -> sorted array
    const days = Object.keys(data.rates).sort().map(date => ({ date, rates: { USD: 1, ...data.rates[date] } }));
    return { days };
}

async function getLatest() {
    const now = Date.now();
    if (cache.latest && now - cache.latest.fetchedAt < LATEST_TTL) return cache.latest;
    try {
        cache.latest = { ...(await fetchLatest()), fetchedAt: now };
    } catch (e) {
        console.error('Latest rates fetch failed:', e.message);
        if (!cache.latest) throw e;
        cache.latest.fetchedAt = now - LATEST_TTL + 5 * 60 * 1000; // retry in 5 min
    }
    return cache.latest;
}

async function getHistory() {
    const now = Date.now();
    if (cache.history && now - cache.history.fetchedAt < HISTORY_TTL) return cache.history;
    try {
        cache.history = { ...(await fetchHistory()), fetchedAt: now };
    } catch (e) {
        console.error('History fetch failed:', e.message);
        if (!cache.history) return { days: [] };
        cache.history.fetchedAt = now - HISTORY_TTL + 15 * 60 * 1000;
    }
    return cache.history;
}

// Units of `code` per 1 USD on a given historical day, following pegs where the
// ECB does not publish the currency (e.g. AED via its USD peg, XOF via EUR).
function usdValueOnDay(code, dayRates, depth = 0) {
    if (dayRates[code] != null) return dayRates[code];
    const profile = byCode[code];
    if (!profile || !profile.peg || profile.peg.kind !== 'fixed' || depth > 2) return null;
    const base = usdValueOnDay(profile.peg.base, dayRates, depth + 1);
    return base == null ? null : base * profile.peg.rate;
}

// 30-day series for from->to, or null when we cannot build one honestly.
function pairSeries(history, from, to) {
    if (!history || !history.days.length) return null;
    const points = [];
    for (const day of history.days) {
        const f = usdValueOnDay(from, day.rates);
        const t = usdValueOnDay(to, day.rates);
        if (f == null || t == null) return null;
        points.push({ date: day.date, rate: t / f });
    }
    return points.length >= 5 ? points : null;
}

function seriesStats(points, currentRate) {
    if (!points) return null;
    const values = points.map(p => p.rate);
    const first = values[0];
    const high = Math.max(...values);
    const low = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const change = ((currentRate - first) / first) * 100;
    const highPoint = points.find(p => p.rate === high);
    const lowPoint = points.find(p => p.rate === low);
    return {
        start: points[0].date, end: points[points.length - 1].date,
        first, high, low, avg, change,
        highDate: highPoint && highPoint.date,
        lowDate: lowPoint && lowPoint.date,
        flat: (high - low) / avg < 0.0005
    };
}

function rateFor(latest, from, to) {
    const f = latest.rates[from];
    const t = latest.rates[to];
    if (!f || !t) return null;
    return t / f;
}

function supportedCodes(latest) {
    return Object.keys(latest.rates).filter(c => !EXCLUDED.has(c)).sort();
}

module.exports = {
    getLatest, getHistory, pairSeries, seriesStats, rateFor, supportedCodes,
    SNAPSHOT_FILE, fetchLatest, fetchHistory
};
