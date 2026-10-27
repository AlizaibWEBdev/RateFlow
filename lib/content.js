// Builds page models (copy + numbers) for converter pages. Every sentence is
// driven by real rate data or real currency facts so pages differ meaningfully
// from each other instead of being the same template with codes swapped.

const fmt = require('./format');
const { byCode } = require('../data/currencies');
const pairs = require('./pairs');
const { rateFor, pairSeries, seriesStats } = require('./rates');
const blogPosts = require('../data/blogPosts');

const BASE_URL = process.env.BASE_URL || 'https://rateflow.vercel.app';
const BANK_MARGIN = 3;

function profile(code) {
    return byCode[code] || {
        code, name: fmt.currencyName(code), plural: fmt.currencyPlural(code),
        symbol: code, flag: fmt.flag(code), aliases: []
    };
}

function usdPerUnit(latest, code) {
    return 1 / latest.rates[code];
}

function sparkline(points, width = 640, height = 160, pad = 10) {
    if (!points) return null;
    const values = points.map(p => p.rate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || max * 0.001 || 1;
    const step = (width - pad * 2) / (points.length - 1);
    const coords = values.map((v, i) => [
        pad + i * step,
        height - pad - ((v - min) / span) * (height - pad * 2)
    ]);
    const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
    return { line, area, width, height };
}

// How pegs relate the two currencies, if at all.
function pegText(from, to, rate) {
    const F = from.code, T = to.code;
    if (from.peg && from.peg.base === T) {
        return from.peg.kind === 'fixed'
            ? `The ${from.name} is ${from.peg.label}. That means 1 ${F} is always worth about ${fmt.rate(1 / from.peg.rate)} ${T}, and any difference you see at a bank or exchange counter is the provider's margin, not market movement.`
            : `The ${from.name} is ${from.peg.label}, so the ${F}/${T} rate only moves within a narrow range.`;
    }
    if (to.peg && to.peg.base === F) {
        return to.peg.kind === 'fixed'
            ? `The ${to.name} is ${to.peg.label}. That means 1 ${F} always buys about ${fmt.rate(to.peg.rate)} ${T}, and any difference you see at a bank or exchange counter is the provider's margin, not market movement.`
            : `The ${to.name} is ${to.peg.label}, so the ${F}/${T} rate only moves within a narrow range.`;
    }
    if (from.peg && to.peg && from.peg.base === to.peg.base && from.peg.kind === 'fixed' && to.peg.kind === 'fixed') {
        const base = profile(from.peg.base);
        return `Both the ${from.name} and the ${to.name} are pegged to the ${base.name}, so the ${F}/${T} cross rate is effectively fixed at about ${fmt.rate(rate)}.`;
    }
    if (from.peg && from.peg.kind === 'fixed') {
        const base = profile(from.peg.base);
        return `The ${from.name} is ${from.peg.label}, so ${F} to ${T} moves almost exactly in line with ${base.code} to ${T}.`;
    }
    if (to.peg && to.peg.kind === 'fixed') {
        const base = profile(to.peg.base);
        return `The ${to.name} is ${to.peg.label}, so ${F} to ${T} moves almost exactly in line with ${F} to ${base.code}.`;
    }
    return null;
}

function trendText(from, to, stats) {
    if (!stats) return null;
    const F = from.code, T = to.code;
    const range = `between ${fmt.rate(stats.low)} and ${fmt.rate(stats.high)} ${T}`;
    if (stats.flat) {
        return `The ${F} to ${T} rate has barely moved over the past 30 days, holding at about ${fmt.rate(stats.avg)} ${T}.`;
    }
    const dir = stats.change >= 0 ? 'strengthened' : 'weakened';
    return `Over the past 30 days the ${from.name} has ${dir} ${Math.abs(stats.change).toFixed(2)}% against the ${to.name}. ` +
        `1 ${F} traded ${range}, with a low on ${fmt.longDate(stats.lowDate)} and a high on ${fmt.longDate(stats.highDate)}. ` +
        `The 30-day average was ${fmt.rate(stats.avg)} ${T}.`;
}

function markupExample(from, to, rate, sampleAmount) {
    const fair = sampleAmount * rate;
    const bank = fair * (1 - BANK_MARGIN / 100);
    return {
        amount: sampleAmount, fair, bank, lost: fair - bank, margin: BANK_MARGIN,
        text: `At today's mid-market rate, ${fmt.amount(sampleAmount)} ${from.code} converts to ${fmt.money(fair)} ${to.code}. ` +
            `A bank or airport kiosk adding a typical ${BANK_MARGIN}% margin would give you only about ${fmt.money(bank)} ${to.code}, ` +
            `which is ${fmt.money(fair - bank)} ${to.code} less. Check the rate you are quoted against the mid-market rate above before you exchange.`
    };
}

// First candidate that fits, so titles/descriptions aren't truncated in results.
const TITLE_MAX = 65;
const DESC_MAX = 160;
function fit(max, ...candidates) {
    return candidates.find(c => c.length <= max) || candidates[candidates.length - 1];
}

function breadcrumbJson(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
            '@type': 'ListItem', position: i + 1, name: it.name, item: BASE_URL + it.href
        }))
    };
}

function webPageJson(name, description, path, updated, currencyProfiles) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name, description,
        url: BASE_URL + path,
        inLanguage: 'en',
        dateModified: updated,
        isPartOf: { '@type': 'WebSite', name: 'RateFlow', url: BASE_URL + '/' },
        publisher: { '@type': 'Organization', name: 'RateFlow', url: BASE_URL + '/', logo: BASE_URL + '/icon.png' },
        about: currencyProfiles.map(c => ({ '@type': 'Thing', name: `${c.name} (${c.code})` })),
        citation: [
            { '@type': 'CreativeWork', name: 'ExchangeRate-API daily rates', url: 'https://www.exchangerate-api.com' },
            { '@type': 'CreativeWork', name: 'European Central Bank euro foreign exchange reference rates', url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html' }
        ]
    };
}

function faqJson(faqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
    };
}

// Blog guides about this pair (either direction), plus the general explainer.
function guidesFor(F, T) {
    const pair = new Set([F, T]);
    const specific = blogPosts.filter(p => p.slug.endsWith('-guide') && pair.has(p.converterFrom) && pair.has(p.converterTo) && p.converterFrom !== p.converterTo);
    const general = blogPosts.filter(p => ['why-exchange-rates-change', 'how-to-get-best-exchange-rate'].includes(p.slug));
    return [...specific, ...general].map(p => ({ title: p.title, href: '/blog/' + p.slug }));
}

function pairBase(latest, history, F, T) {
    const from = profile(F);
    const to = profile(T);
    const rate = rateFor(latest, F, T);
    const series = pairSeries(history, F, T);
    const stats = seriesStats(series, rate);
    return { from, to, rate, inverse: 1 / rate, series, stats, updated: latest.updated };
}

function buildPairPage(latest, history, F, T) {
    const base = pairBase(latest, history, F, T);
    const { from, to, rate, inverse, stats } = base;
    const date = fmt.longDate(latest.updated);
    const indexable = pairs.isIndexablePair(F, T);
    const fromUsd = usdPerUnit(latest, F);
    const toUsd = usdPerUnit(latest, T);
    const fromAmounts = pairs.tableAmounts(fromUsd);
    const toAmounts = pairs.tableAmounts(toUsd);

    const tableFrom = fromAmounts.map(a => ({
        amount: a, value: a * rate,
        href: pairs.isIndexableAmount(F, T, a, fromUsd) ? pairs.amountPath(F, T, fmt.amountSlug(a)) : null
    }));
    const tableTo = toAmounts.map(a => ({
        amount: a, value: a * inverse,
        href: pairs.isIndexableAmount(T, F, a, toUsd) ? pairs.amountPath(T, F, fmt.amountSlug(a)) : null
    }));

    // Last 10 published daily rates, newest first, with day-on-day change.
    const recent = base.series
        ? base.series.slice(-11).map((p, i, arr) => ({
            date: p.date, rate: p.rate,
            change: i ? ((p.rate - arr[i - 1].rate) / arr[i - 1].rate) * 100 : null
        })).slice(1).reverse()
        : null;
    let recentSummary = null;
    if (recent && recent.length) {
        const ups = recent.filter(d => d.change > 0).length;
        const downs = recent.filter(d => d.change < 0).length;
        const biggest = recent.reduce((a, b) => Math.abs(b.change) > Math.abs(a.change) ? b : a);
        recentSummary = `Over the last ${recent.length} trading days the ${F} rose against the ${T} on ${ups} ${ups === 1 ? 'day' : 'days'} and fell on ${downs}. ` +
            `The biggest single-day move was ${fmt.pct(biggest.change)} on ${fmt.longDate(biggest.date)}.`;
    }

    const peg = pegText(from, to, rate);
    const directPeg = (from.peg && from.peg.kind === 'fixed' && from.peg.base === T) ||
        (to.peg && to.peg.kind === 'fixed' && to.peg.base === F);
    // A fixed peg already explains why the rate does not move.
    const trend = directPeg ? null : trendText(from, to, stats);
    const sample = fromAmounts[7];
    const markup = markupExample(from, to, rate, sample);
    const exampleAmount = fromAmounts[4];
    const faqAmount = fromAmounts[5];

    const faqs = [
        {
            q: `What is the ${F} to ${T} exchange rate today?`,
            a: `On ${date}, 1 ${from.name} (${F}) = ${fmt.rate(rate)} ${to.plural} (${T}) at the mid-market rate. In the other direction, 1 ${T} = ${fmt.rate(inverse)} ${F}.`
        },
        {
            q: `How much is ${fmt.amount(faqAmount)} ${F} in ${T}?`,
            a: `${fmt.amount(faqAmount)} ${from.plural} is worth ${fmt.money(faqAmount * rate)} ${to.plural} at today's rate of ${fmt.rate(rate)}.`
        },
        {
            q: `How do I convert ${F} to ${T}?`,
            a: `Multiply the amount in ${F} by ${fmt.rate(rate)}. For example, ${fmt.amount(exampleAmount)} ${F} × ${fmt.rate(rate)} = ${fmt.money(exampleAmount * rate)} ${T}. To convert ${T} back to ${F}, multiply by ${fmt.rate(inverse)} instead.`
        }
    ];
    // FAQ answers are short and say something the body copy doesn't repeat word for word.
    if (directPeg) {
        faqs.push({
            q: `Is the ${from.name} pegged to the ${to.name}?`,
            a: `Yes. Because of the official peg, 1 ${F} stays at about ${fmt.rate(rate)} ${T} and 1 ${T} at about ${fmt.rate(inverse)} ${F}.`
        });
    }
    if (trend) {
        faqs.push({
            q: `Has the ${F} gone up or down against the ${T} recently?`,
            a: stats.flat
                ? `It has barely moved: about ${fmt.rate(stats.avg)} ${T} throughout the past 30 days.`
                : `${stats.change >= 0 ? 'Up' : 'Down'} ${Math.abs(stats.change).toFixed(2)}% over the past 30 days, from ${fmt.rate(stats.first)} to ${fmt.rate(rate)} ${T}.`
        });
    }
    faqs.push({
        q: `Why is my bank's ${F} to ${T} rate different?`,
        a: `Banks and exchange services sell currency at the mid-market rate minus a margin, usually 1–5%. On ${fmt.amount(markup.amount)} ${F}, a ${BANK_MARGIN}% margin costs about ${fmt.money(markup.lost)} ${T}.`
    });

    const title = fit(TITLE_MAX,
        `${F} to ${T}: 1 ${F} = ${fmt.rate(rate)} ${T} Today | ${from.name} to ${to.name}`,
        `${F} to ${T}: 1 ${F} = ${fmt.rate(rate)} ${T} | ${from.name} Rate Today`,
        `${F} to ${T} Rate Today: 1 ${F} = ${fmt.rate(rate)} ${T}`);
    const trendShort = stats && !stats.flat
        ? ` ${stats.change >= 0 ? 'Up' : 'Down'} ${Math.abs(stats.change).toFixed(2)}% in 30 days.`
        : '';
    // Answer-first summary: the sentence search engines and AI assistants quote.
    const answer = `1 ${from.name} = ${fmt.rate(rate)} ${to.plural} on ${date}, so ${fmt.amount(faqAmount)} ${F} is ${fmt.money(faqAmount * rate)} ${T} and 1 ${T} is ${fmt.rate(inverse)} ${F}. ` +
        (directPeg
            ? `The rate is fixed by an official peg, so it does not move day to day.`
            : stats && !stats.flat
                ? `The ${F} has ${stats.change >= 0 ? 'risen' : 'fallen'} ${Math.abs(stats.change).toFixed(2)}% against the ${T} over the past 30 days.`
                : '');
    const description = fit(DESC_MAX,
        `Convert ${from.name} to ${to.name}: 1 ${F} = ${fmt.rate(rate)} ${T} on ${date}.${trendShort} Free ${F}/${T} converter with conversion tables, chart and bank-fee check.`,
        `1 ${F} = ${fmt.rate(rate)} ${T} on ${date}.${trendShort} Free ${F} to ${T} converter with conversion tables, 30-day chart and bank-fee check.`,
        `1 ${F} = ${fmt.rate(rate)} ${T} on ${date}.${trendShort} Conversion tables, 30-day chart and bank-fee check.`);

    const crumbs = [
        { name: 'Home', href: '/' },
        { name: 'Currencies', href: '/currencies' }
    ];
    if (byCode[F]) crumbs.push({ name: `${from.name} (${F})`, href: pairs.currencyPath(F) });
    crumbs.push({ name: `${F} to ${T}`, href: pairs.pairPath(F, T) });

    return {
        ...base,
        kind: 'pair',
        F, T, date,
        title, description,
        h1: `Convert ${from.name} to ${to.name} (${F} to ${T})`,
        canonical: BASE_URL + pairs.pairPath(F, T),
        robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow',
        answer, recent, recentSummary,
        tableFrom, tableTo,
        peg, trend, markup,
        chart: stats && !stats.flat ? sparkline(base.series) : null,
        faqs,
        related: pairs.relatedPairs(F, T).map(p => ({
            ...p, href: pairs.pairPath(p.from, p.to), rate: rateFor(latest, p.from, p.to),
            fromName: fmt.currencyName(p.from), toName: fmt.currencyName(p.to)
        })),
        reverseHref: pairs.pairPath(T, F),
        guides: guidesFor(F, T),
        profiles: [from, to].map(c => ({ ...c, compact: pairs.HUBS.includes(c.code) && !(pairs.HUBS.includes(F) && pairs.HUBS.includes(T)) })),
        crumbs,
        jsonLd: [
            webPageJson(title, description, pairs.pairPath(F, T), latest.updated, [from, to]),
            breadcrumbJson(crumbs),
            faqJson(faqs)
        ]
    };
}

function buildAmountPage(latest, history, F, T, amount) {
    const base = pairBase(latest, history, F, T);
    const { from, to, rate, inverse, stats } = base;
    const value = amount * rate;
    const date = fmt.longDate(latest.updated);
    const amt = fmt.amount(amount);
    const unitUsd = usdPerUnit(latest, F);
    const list = pairs.amountsFor(unitUsd);
    const top = pairs.isTopPair(F, T);
    const indexable = pairs.isIndexableAmount(F, T, amount, unitUsd);

    const margins = [0, 1, 2, 3, 5].map(m => ({
        margin: m, value: value * (1 - m / 100), lost: value * (m / 100),
        label: m === 0 ? 'Mid-market rate' : m === 1 ? 'Specialist transfer service' : m === 2 ? 'Card with low FX fee' : m === 3 ? 'Typical bank' : 'Airport / hotel exchange'
    }));

    // Neighbouring amounts from the curated list, plus the current amount.
    const idx = list.findIndex(a => a >= amount);
    const around = list.slice(Math.max(0, (idx < 0 ? list.length : idx) - 4), (idx < 0 ? list.length : idx) + 5);
    const nearby = [...new Set([...around, amount])].sort((a, b) => a - b).map(a => ({
        amount: a, value: a * rate, current: a === amount,
        href: top && list.includes(a) ? pairs.amountPath(F, T, fmt.amountSlug(a)) : null
    }));

    const others = pairs.POPULAR_TARGETS
        .filter(c => c !== F && latest.rates[c])
        .map(c => ({
            code: c, name: fmt.currencyName(c), value: amount * rateFor(latest, F, c),
            href: pairs.isIndexableAmount(F, c, amount, unitUsd)
                ? pairs.amountPath(F, c, fmt.amountSlug(amount))
                : pairs.isIndexablePair(F, c) ? pairs.pairPath(F, c) : null
        }));

    const peg = pegText(from, to, rate);
    const directPeg = (from.peg && from.peg.kind === 'fixed' && from.peg.base === T) ||
        (to.peg && to.peg.kind === 'fixed' && to.peg.base === F);
    const moved = stats && !stats.flat;
    const range = moved
        ? `Over the past 30 days, ${amt} ${F} has been worth between ${fmt.money(amount * stats.low)} and ${fmt.money(amount * stats.high)} ${T}. ` +
          `Compared with ${fmt.longDate(stats.start)}, the same amount is now worth ${fmt.money(Math.abs(value - amount * stats.first))} ${T} ${value >= amount * stats.first ? 'more' : 'less'}.`
        : stats && !peg
            ? `The ${F}/${T} rate has been stable over the past 30 days, so ${amt} ${F} has consistently been worth about ${fmt.money(value)} ${T}.`
            : null;
    const reverseAmountHref = pairs.isIndexableAmount(T, F, amount, usdPerUnit(latest, T))
        ? pairs.amountPath(T, F, fmt.amountSlug(amount))
        : pairs.pairPath(T, F);

    const faqs = [
        {
            q: `How much is ${amt} ${F} in ${T}?`,
            a: `${amt} ${from.plural} (${F}) is ${fmt.money(value)} ${to.plural} (${T}) at the mid-market rate on ${date}, using 1 ${F} = ${fmt.rate(rate)} ${T}.`
        },
        {
            q: `How much ${T} will I actually get for ${amt} ${F}?`,
            a: `That depends on the provider's margin. With a typical ${BANK_MARGIN}% bank margin you would receive about ${fmt.money(value * (1 - BANK_MARGIN / 100))} ${T}; a low-cost transfer service charging around 1% would give you about ${fmt.money(value * 0.99)} ${T}.`
        },
        {
            q: `How much is ${amt} ${T} in ${F}?`,
            a: `${amt} ${to.plural} is ${fmt.money(amount * inverse)} ${from.plural} at today's rate of 1 ${T} = ${fmt.rate(inverse)} ${F}.`
        }
    ];
    if (moved) {
        const before = amount * stats.first;
        faqs.push({
            q: `Is ${amt} ${F} worth more or less in ${T} than last month?`,
            a: `${value >= before ? 'More' : 'Less'}: ${fmt.money(value)} ${T} today versus ${fmt.money(before)} ${T} on ${fmt.longDate(stats.start)}.`
        });
    }
    if (directPeg) {
        faqs.push({
            q: `Does the ${F} to ${T} rate change?`,
            a: `Not in practice. An official peg keeps ${amt} ${F} at about ${fmt.money(value)} ${T}, so differences between providers come from their fees.`
        });
    }

    const title = fit(TITLE_MAX,
        `${amt} ${F} to ${T}: ${amt} ${from.plural} = ${fmt.money(value)} ${to.plural}`,
        `${amt} ${F} to ${T}: ${amt} ${F} = ${fmt.money(value)} ${to.plural}`,
        `${amt} ${F} to ${T} = ${fmt.money(value)} ${T} Today`);
    const description = fit(DESC_MAX,
        `How much is ${amt} ${F} in ${T}? ${amt} ${from.plural} = ${fmt.money(value)} ${to.plural} at today's mid-market rate (${date}). See what banks really pay, the 30-day range and other amounts.`,
        `${amt} ${from.plural} = ${fmt.money(value)} ${to.plural} at today's mid-market rate (${date}). See what banks really pay and other amounts.`,
        `${amt} ${F} = ${fmt.money(value)} ${T} at today's mid-market rate (${date}). See what banks really pay and other amounts.`);

    const crumbs = [
        { name: 'Home', href: '/' },
        { name: 'Currencies', href: '/currencies' },
        { name: `${F} to ${T}`, href: pairs.pairPath(F, T) },
        { name: `${amt} ${F}`, href: pairs.amountPath(F, T, fmt.amountSlug(amount)) }
    ];

    return {
        ...base,
        kind: 'amount',
        F, T, date, amount, amt, value,
        title, description,
        h1: `${amt} ${F} to ${T}`,
        canonical: BASE_URL + pairs.amountPath(F, T, fmt.amountSlug(amount)),
        robots: indexable ? 'index, follow' : 'noindex, follow',
        margins, nearby, others, range, peg,
        intro: `${amt} ${from.plural} is worth ${fmt.money(value)} ${to.plural} today. The ${F} to ${T} mid-market rate on ${date} is 1 ${F} = ${fmt.rate(rate)} ${T}, so ${amt} × ${fmt.rate(rate)} = ${fmt.money(value)}.`,
        pairHref: pairs.pairPath(F, T),
        reverseAmountHref,
        chart: moved ? sparkline(base.series) : null,
        faqs,
        crumbs,
        jsonLd: [
            webPageJson(title, description, pairs.amountPath(F, T, fmt.amountSlug(amount)), latest.updated, [from, to]),
            breadcrumbJson(crumbs),
            faqJson(faqs)
        ]
    };
}

function buildCurrencyPage(latest, history, code) {
    const c = profile(code);
    const date = fmt.longDate(latest.updated);
    const targets = [...new Set([...pairs.POPULAR_TARGETS, 'CHF', 'SGD', 'HKD', 'NZD', 'MXN', 'BRL', 'ZAR', 'TRY', 'THB', 'MYR', 'BDT', 'QAR', 'KWD', 'EGP', 'NGN'])]
        .filter(t => t !== code && latest.rates[t]);
    const rows = targets.map(t => {
        const r = rateFor(latest, code, t);
        const series = pairSeries(history, code, t);
        const stats = seriesStats(series, r);
        return {
            code: t, name: fmt.currencyName(t), flag: fmt.flag(t), rate: r, inverse: 1 / r,
            change: stats && !stats.flat ? stats.change : (stats ? 0 : null),
            href: pairs.isIndexablePair(code, t) ? pairs.pairPath(code, t) : null,
            reverseHref: pairs.isIndexablePair(t, code) ? pairs.pairPath(t, code) : null
        };
    });
    const usd = rateFor(latest, code, 'USD');
    const all = pairs.pairsForCurrency(code).map(p => ({
        ...p, href: pairs.pairPath(p.from, p.to),
        label: `${p.from} to ${p.to}`, name: `${fmt.currencyName(p.from)} to ${fmt.currencyName(p.to)}`
    }));

    const faqs = [
        {
            q: `How much is 1 ${code} in US dollars today?`,
            a: `On ${date}, 1 ${c.name} (${code}) = ${fmt.rate(usd)} US dollars, and 1 USD = ${fmt.rate(1 / usd)} ${code}.`
        },
        { q: `Who issues the ${c.name}?`, a: `The ${c.name} is issued by the ${c.bank} and is divided into ${c.subunit}.` },
        { q: `What is the symbol for the ${c.name}?`, a: `The ${c.name} uses the symbol ${c.symbol} and the ISO 4217 code ${code}.` }
    ];
    if (c.peg) faqs.push({ q: `Is the ${c.name} pegged?`, a: `Yes. The ${c.name} is ${c.peg.label}.` });

    const crumbs = [
        { name: 'Home', href: '/' },
        { name: 'Currencies', href: '/currencies' },
        { name: `${c.name} (${code})`, href: pairs.currencyPath(code) }
    ];

    // Deliberately not "AED to USD ...": the pair pages own those queries.
    const title = fit(TITLE_MAX,
        `${c.name} (${code}): Exchange Rates${c.peg ? ', Peg' : ''} & Currency Facts`,
        `${c.name} (${code}) Exchange Rates & Facts`);
    const description = fit(DESC_MAX,
        `${c.name} exchange rates for ${date}: 1 ${code} = ${fmt.rate(usd)} USD. Compare ${code} with ${targets.length} major currencies, with 30-day changes, peg, symbol and central bank facts.`,
        `1 ${code} = ${fmt.rate(usd)} USD on ${date}. Compare the ${code} with ${targets.length} major currencies, plus 30-day changes and central bank facts.`);
    return {
        kind: 'currency',
        c, code, date, rows, all, usd, updated: latest.updated,
        title, description,
        h1: `${c.name} (${code}) Exchange Rates`,
        canonical: BASE_URL + pairs.currencyPath(code),
        robots: 'index, follow',
        faqs,
        crumbs,
        jsonLd: [webPageJson(title, description, pairs.currencyPath(code), latest.updated, [c]), breadcrumbJson(crumbs), faqJson(faqs)]
    };
}

module.exports = { BASE_URL, buildPairPage, buildAmountPage, buildCurrencyPage, profile, breadcrumbJson, faqJson, sparkline };
