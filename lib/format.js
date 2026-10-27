const nameFormatter = new Intl.DisplayNames(['en'], { type: 'currency' });
const { byCode } = require('../data/currencies');
const flags = require('../data/flags');

function group(n, decimals) {
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// Exchange rate: enough significant digits to be useful for any magnitude.
function rate(r) {
    if (r == null || !isFinite(r)) return '—';
    if (r >= 1000) return group(r, 2);
    if (r >= 1) return group(r, 4);
    const digits = Math.min(10, Math.max(4, 4 - Math.floor(Math.log10(r))));
    return r.toFixed(digits).replace(/(\.\d*?[1-9])0+$/, '$1');
}

// Money amount: 2 decimals normally, more for tiny values.
function money(n) {
    if (n == null || !isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs === 0) return '0';
    if (abs >= 1) return group(n, 2);
    return rate(n);
}

// Amount as typed in a URL or heading: 1000 -> "1,000", 2.5 -> "2.5"
function amount(n) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

// Amount as a URL segment: no grouping, no trailing zeros.
function amountSlug(n) {
    return String(Number(n.toFixed(4)));
}

function pct(n) {
    if (n == null || !isFinite(n)) return '—';
    const sign = n > 0 ? '+' : '';
    return `${sign}${n.toFixed(2)}%`;
}

function longDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function shortDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function currencyName(code) {
    if (byCode[code]) return byCode[code].name;
    try {
        return nameFormatter.of(code);
    } catch (e) {
        return code;
    }
}

function currencyPlural(code) {
    if (byCode[code]) return byCode[code].plural;
    return currencyName(code);
}

function flag(code) {
    return (byCode[code] && byCode[code].flag) || flags[code] || '';
}

module.exports = { rate, money, amount, amountSlug, pct, longDate, shortDate, currencyName, currencyPlural, flag };
