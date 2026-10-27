const express = require('express');
const cors = require('cors');
const blogPosts = require('./data/blogPosts');
const { currencies, byCode } = require('./data/currencies');
const rates = require('./lib/rates');
const pairs = require('./lib/pairs');
const fmt = require('./lib/format');
const content = require('./lib/content');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = content.BASE_URL;
const STATIC_LASTMOD = '2026-10-27';

app.use(cors());

// Only the production hostname should be indexed; preview and deployment URLs
// (e.g. rateflow-abc123.vercel.app) serve identical pages.
const PROD_HOSTNAME = new URL(BASE_URL).hostname;
app.use((req, res, next) => {
    if (req.hostname !== PROD_HOSTNAME && req.hostname !== 'localhost') res.set('X-Robots-Tag', 'noindex');
    next();
});
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public', { maxAge: '7d' }));

app.locals.fmt = fmt;
app.locals.pairs = pairs;
app.locals.BASE_URL = BASE_URL;
app.locals.year = new Date().getFullYear();
app.locals.jsonLd = obj => JSON.stringify(obj).replace(/</g, '\\u003c');
app.locals.footerPairs = [
    'AED-USD', 'USD-INR', 'USD-PKR', 'EUR-GBP', 'GBP-EUR', 'THB-USD', 'AUD-USD', 'EUR-USD',
    'GBP-USD', 'SAR-PKR', 'AED-INR', 'USD-PHP'
].map(p => p.split('-'));

// Pages are cheap to cache at the edge: rates update daily at the source.
function cacheHtml(res) {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
}

// ---------- Legacy URLs (/tool/currency-converter-x-to-y/xxx-to-yyy/) ----------
// Registered before the trailing-slash rule so old URLs reach their new home in one 301.
async function redirectPair(res, next, p) {
    try {
        const latest = await rates.getLatest();
        if (!p || p.from === p.to || !isSupported(latest, p.from) || !isSupported(latest, p.to)) return notFound(res);
        res.redirect(301, pairs.pairPath(p.from, p.to));
    } catch (e) {
        next(e);
    }
}

app.get('/tool/:description/:slug', (req, res, next) => redirectPair(res, next, parsePair(req.params.slug)));

app.get('/tool/:description', (req, res, next) => {
    const { from, to } = req.query;
    if (from && to) return redirectPair(res, next, parsePair(`${from}-to-${to}`));
    const m = /([a-z]{3}-to-[a-z]{3})$/i.exec(req.params.description);
    redirectPair(res, next, m && parsePair(m[1]));
});

// One URL per page: drop trailing slashes on everything except the root.
app.use((req, res, next) => {
    if (req.method === 'GET' && req.path.length > 1 && req.path.endsWith('/')) {
        const query = req.url.slice(req.path.length);
        return res.redirect(301, req.path.replace(/\/+$/, '') + query);
    }
    next();
});

async function loadRates() {
    const [latest, history] = await Promise.all([rates.getLatest(), rates.getHistory()]);
    return { latest, history };
}

function isSupported(latest, code) {
    return code && latest.rates[code] != null;
}

function converterData(latest, from, to, amount) {
    const codes = rates.supportedCodes(latest);
    return {
        from, to, amount,
        count: codes.length,
        // The full currency list is filled in by converter.js, keeping the HTML small.
        payload: {
            rates: Object.fromEntries(codes.map(c => [c, latest.rates[c]])),
            updated: latest.updated,
            names: Object.fromEntries(codes.map(c => [c, fmt.currencyName(c)])),
            flags: Object.fromEntries(codes.map(c => [c, fmt.flag(c)]))
        }
    };
}

function notFound(res) {
    res.status(404).render('404', {
        page: { title: 'Page not found | RateFlow', description: 'The page you are looking for does not exist.', robots: 'noindex, follow', canonical: null, jsonLd: [] }
    });
}

// ---------- Home ----------
app.get('/', async (req, res, next) => {
    try {
        const { latest, history } = await loadRates();
        const popular = [
            'USD-EUR', 'EUR-USD', 'GBP-USD', 'USD-GBP', 'AED-USD', 'USD-INR', 'USD-PKR', 'EUR-GBP',
            'GBP-EUR', 'USD-JPY', 'AUD-USD', 'USD-CAD', 'THB-USD', 'USD-PHP', 'SAR-PKR', 'AED-INR'
        ].map(p => {
            const [from, to] = p.split('-');
            const r = rates.rateFor(latest, from, to);
            const stats = rates.seriesStats(rates.pairSeries(history, from, to), r);
            return { from, to, rate: r, change: stats && !stats.flat ? stats.change : (stats ? 0 : null), href: pairs.pairPath(from, to) };
        });
        const regions = {};
        for (const c of currencies) (regions[c.region] = regions[c.region] || []).push(c);
        const faqs = [
            { q: 'Where do RateFlow\'s exchange rates come from?', a: 'Current rates come from ExchangeRate-API and are refreshed daily. 30-day charts use European Central Bank reference rates published via Frankfurter. All rates are mid-market rates, without any bank margin added.' },
            { q: 'How many currencies does RateFlow support?', a: `The converter supports ${rates.supportedCodes(latest).length} currencies, with detailed pages for ${currencies.length} of the most-used ones, including USD, EUR, GBP, AED, INR, PKR, SAR and PHP.` },
            { q: 'Is RateFlow free?', a: 'Yes. RateFlow is free to use with no sign-up.' },
            { q: 'What is the mid-market exchange rate?', a: 'The mid-market rate is the midpoint between the buy and sell prices of two currencies on the global market. It is the fairest benchmark; banks and exchange services usually give you a worse rate and keep the difference as a fee.' },
            { q: 'Why is the rate my bank offers different?', a: 'Banks, airport kiosks and card providers add a margin to the mid-market rate, typically 1% to 5%. Use the mid-market rate on RateFlow to see how much you are really paying.' }
        ];
        cacheHtml(res);
        res.render('home', {
            page: {
                title: 'Currency Converter – Live Exchange Rates Today | RateFlow',
                description: `Free currency converter with today's mid-market rates for ${rates.supportedCodes(latest).length} currencies. Convert USD, EUR, GBP, AED, INR, PKR and more, with 30-day trends.`,
                canonical: BASE_URL + '/',
                robots: 'index, follow, max-image-preview:large',
                jsonLd: [
                    {
                        '@context': 'https://schema.org', '@type': 'WebSite', name: 'RateFlow', url: BASE_URL + '/'
                    },
                    {
                        '@context': 'https://schema.org', '@type': 'WebApplication', name: 'RateFlow Currency Converter',
                        url: BASE_URL + '/', applicationCategory: 'FinanceApplication', operatingSystem: 'Web',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
                    },
                    {
                        '@context': 'https://schema.org', '@type': 'Organization', name: 'RateFlow',
                        url: BASE_URL + '/', logo: BASE_URL + '/icon.png'
                    },
                    content.faqJson(faqs)
                ]
            },
            date: fmt.longDate(latest.updated),
            popular, regions, faqs,
            posts: blogPosts.slice(0, 3),
            converter: converterData(latest, 'USD', 'EUR', 1)
        });
    } catch (e) {
        next(e);
    }
});

// ---------- Static pages ----------
app.get('/methodology', async (req, res, next) => {
    try {
        const latest = await rates.getLatest();
        const crumbs = [{ name: 'Home', href: '/' }, { name: 'Methodology', href: '/methodology' }];
        const title = 'How RateFlow Sources Exchange Rates – Methodology';
        const description = 'Where RateFlow\'s exchange rates come from, how often they update, how cross rates and pegged-currency history are calculated, and their limitations.';
        cacheHtml(res);
        res.render('methodology', {
            page: {
                title, description, canonical: BASE_URL + '/methodology', robots: 'index, follow',
                jsonLd: [content.breadcrumbJson(crumbs)]
            },
            crumbs,
            reviewed: STATIC_LASTMOD,
            updated: latest.updated,
            count: rates.supportedCodes(latest).length,
            pegged: currencies.filter(c => c.peg && c.peg.kind === 'fixed')
        });
    } catch (e) {
        next(e);
    }
});

// Plain-text site guide for AI assistants and answer engines (llmstxt.org).
app.get('/llms.txt', async (req, res, next) => {
    try {
        const latest = await rates.getLatest();
        const line = (from, to) => `- [${from} to ${to}](${BASE_URL}${pairs.pairPath(from, to)}): 1 ${from} = ${fmt.rate(rates.rateFor(latest, from, to))} ${to} (${latest.updated.slice(0, 10)})`;
        const body = [
            '# RateFlow',
            '',
            `> Free currency converter showing daily mid-market exchange rates for ${rates.supportedCodes(latest).length} currencies, with 30-day history from European Central Bank reference rates, conversion tables and bank-margin comparisons.`,
            '',
            'Rates are mid-market benchmarks (no provider margin). Current rates: ExchangeRate-API, updated daily. History: ECB reference rates via Frankfurter, extended to officially pegged currencies (e.g. AED, SAR, QAR, OMR, BHD, JOD, XOF, XAF, NPR) using their peg rates.',
            '',
            '## Key pages',
            `- [Methodology](${BASE_URL}/methodology): data sources, update frequency, rounding and limitations`,
            `- [All currencies](${BASE_URL}/currencies): every currency with its USD value, central bank and peg`,
            `- [Converter](${BASE_URL}/): convert any of the supported currencies`,
            '',
            '## Most searched rates',
            ...pairs.TOP_PAIRS.slice(0, 30).map(p => line(...p.split('-'))),
            '',
            '## Currency profiles',
            ...currencies.map(c => `- [${c.name} (${c.code})](${BASE_URL}${pairs.currencyPath(c.code)})${c.peg ? `: ${c.peg.label}` : ''}`),
            '',
            '## URL patterns',
            `- Pair page: ${BASE_URL}/convert/{from}-to-{to} (ISO 4217 codes, lowercase), e.g. ${BASE_URL}/convert/aed-to-usd`,
            `- Amount page: ${BASE_URL}/convert/{from}-to-{to}/{amount}, e.g. ${BASE_URL}/convert/aed-to-usd/1000`,
            ''
        ].join('\n');
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=21600');
        res.send(body);
    } catch (e) {
        next(e);
    }
});

app.get('/about', (req, res) => res.render('about'));
app.get('/privacy', (req, res) => res.render('privacy'));
app.get('/contact', (req, res) => res.render('contact'));

app.get('/blog', (req, res) => {
    res.render('blog', { posts: blogPosts });
});

app.get('/blog/:slug', (req, res) => {
    const post = blogPosts.find(p => p.slug === req.params.slug);
    if (!post) return notFound(res);
    const canonical = `${BASE_URL}/blog/${post.slug}`;
    res.render('blog-post', { post, canonical });
});

// ---------- Currency hubs ----------
app.get('/currencies', async (req, res, next) => {
    try {
        const { latest } = await loadRates();
        const regions = {};
        for (const c of currencies) {
            (regions[c.region] = regions[c.region] || []).push({ ...c, usd: rates.rateFor(latest, c.code, 'USD') });
        }
        const crumbs = [{ name: 'Home', href: '/' }, { name: 'Currencies', href: '/currencies' }];
        cacheHtml(res);
        res.render('currencies', {
            page: {
                title: `World Currencies & Exchange Rates Today | RateFlow`,
                description: `Exchange rates for ${currencies.length} major world currencies against the US dollar, with symbols, central banks and pegs. Pick a currency to see all its conversions.`,
                canonical: BASE_URL + '/currencies',
                robots: 'index, follow',
                jsonLd: [content.breadcrumbJson(crumbs)]
            },
            crumbs, regions,
            date: fmt.longDate(latest.updated),
            top: pairs.TOP_PAIRS.map(p => p.split('-'))
        });
    } catch (e) {
        next(e);
    }
});

app.get('/currency/:code', async (req, res, next) => {
    try {
        const raw = req.params.code;
        const code = raw.toUpperCase();
        if (!byCode[code]) return notFound(res);
        if (raw !== code.toLowerCase()) return res.redirect(301, pairs.currencyPath(code));
        const { latest, history } = await loadRates();
        if (!isSupported(latest, code)) return notFound(res);
        const model = content.buildCurrencyPage(latest, history, code);
        cacheHtml(res);
        res.render('currency', { page: model, m: model, converter: converterData(latest, code, code === 'USD' ? 'EUR' : 'USD', 1) });
    } catch (e) {
        next(e);
    }
});

// ---------- Converter pages ----------
function parsePair(slug) {
    const match = /^([a-z]{3})-to-([a-z]{3})$/i.exec(slug || '');
    if (!match) return null;
    return { from: match[1].toUpperCase(), to: match[2].toUpperCase() };
}

function parseAmount(raw) {
    if (!/^\d[\d,]*(\.\d+)?$/.test(raw)) return null;
    const n = Number(raw.replace(/,/g, ''));
    if (!isFinite(n) || n <= 0 || n > 1e12) return null;
    return n;
}

app.get('/convert/:pair', async (req, res, next) => {
    try {
        const p = parsePair(req.params.pair);
        if (!p || p.from === p.to) return notFound(res);
        const canonicalPath = pairs.pairPath(p.from, p.to);
        if (req.path !== canonicalPath) return res.redirect(301, canonicalPath);
        const { latest, history } = await loadRates();
        if (!isSupported(latest, p.from) || !isSupported(latest, p.to)) return notFound(res);
        const model = content.buildPairPage(latest, history, p.from, p.to);
        cacheHtml(res);
        res.render('pair', { page: model, m: model, converter: converterData(latest, p.from, p.to, 1) });
    } catch (e) {
        next(e);
    }
});

app.get('/convert/:pair/:amount', async (req, res, next) => {
    try {
        const p = parsePair(req.params.pair);
        const amount = parseAmount(req.params.amount);
        if (!p || p.from === p.to || amount == null) return notFound(res);
        // A single unit is exactly what the pair page answers.
        if (amount === 1) return res.redirect(301, pairs.pairPath(p.from, p.to));
        const canonicalPath = pairs.amountPath(p.from, p.to, fmt.amountSlug(amount));
        if (req.path !== canonicalPath) return res.redirect(301, canonicalPath);
        const { latest, history } = await loadRates();
        if (!isSupported(latest, p.from) || !isSupported(latest, p.to)) return notFound(res);
        const model = content.buildAmountPage(latest, history, p.from, p.to, amount);
        cacheHtml(res);
        res.render('amount', { page: model, m: model, converter: converterData(latest, p.from, p.to, amount) });
    } catch (e) {
        next(e);
    }
});

// Short form people type directly: /aed-to-usd
app.get('/:pair', (req, res, next) => {
    const p = parsePair(req.params.pair);
    if (!p) return next();
    redirectPair(res, next, p);
});

// ---------- API for the client-side converter ----------
app.get('/api/rates', async (req, res, next) => {
    try {
        const latest = await rates.getLatest();
        res.set('Cache-Control', 'public, max-age=600, s-maxage=3600');
        res.json({ base: 'USD', updated: latest.updated, rates: latest.rates });
    } catch (e) {
        next(e);
    }
});

// ---------- Sitemaps ----------
function xmlUrls(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map(u => `  <url><loc>${BASE_URL}${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
        '\n</urlset>\n';
}

function sendXml(res, xml) {
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=21600');
    res.send(xml);
}

const SITEMAPS = ['pages', 'currencies', 'pairs', 'amounts'];

function sitemapIndex(req, res, next) {
    rates.getLatest().then(latest => {
        const day = latest.updated.slice(0, 10);
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            SITEMAPS.map(s => `  <sitemap><loc>${BASE_URL}/sitemaps/${s}.xml</loc><lastmod>${s === 'pages' ? STATIC_LASTMOD : day}</lastmod></sitemap>`).join('\n') +
            '\n</sitemapindex>\n';
        sendXml(res, xml);
    }).catch(next);
}

app.get('/sitemap.xml', sitemapIndex);
app.get('/sites.xml', sitemapIndex);

app.get('/sitemaps/:name.xml', async (req, res, next) => {
    try {
        const latest = await rates.getLatest();
        const day = latest.updated.slice(0, 10);
        let urls;
        switch (req.params.name) {
            case 'pages':
                urls = [
                    { loc: '/', lastmod: day },
                    { loc: '/currencies', lastmod: day },
                    { loc: '/blog', lastmod: blogPosts.map(p => p.updated || p.date).sort().pop() },
                    ...blogPosts.map(p => ({ loc: `/blog/${p.slug}`, lastmod: p.updated || p.date })),
                    ...['methodology', 'about', 'contact', 'privacy'].map(p => ({ loc: `/${p}`, lastmod: STATIC_LASTMOD }))
                ];
                break;
            case 'currencies':
                urls = currencies.filter(c => latest.rates[c.code]).map(c => ({ loc: pairs.currencyPath(c.code), lastmod: day }));
                break;
            case 'pairs':
                urls = pairs.allIndexablePairs()
                    .filter(p => latest.rates[p.from] && latest.rates[p.to])
                    .sort((a, b) => b.priority - a.priority)
                    .map(p => ({ loc: pairs.pairPath(p.from, p.to), lastmod: day }));
                break;
            case 'amounts':
                urls = [];
                for (const p of pairs.TOP_PAIRS) {
                    const [from, to] = p.split('-');
                    if (!latest.rates[from] || !latest.rates[to]) continue;
                    for (const a of pairs.amountsFor(1 / latest.rates[from])) {
                        urls.push({ loc: pairs.amountPath(from, to, fmt.amountSlug(a)), lastmod: day });
                    }
                }
                break;
            default:
                return notFound(res);
        }
        sendXml(res, xmlUrls(urls));
    } catch (e) {
        next(e);
    }
});

// ---------- Errors ----------
app.use((req, res) => notFound(res));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(503).set('Retry-After', '300').render('404', {
        page: { title: 'Temporarily unavailable | RateFlow', description: 'Exchange rates are temporarily unavailable.', robots: 'noindex', canonical: null, jsonLd: [] },
        unavailable: true
    });
});

// On Vercel the exported app is used as the request handler.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
