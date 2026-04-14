const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const blogPosts = require('./data/blogPosts');

app.use(cors());
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.render('index');
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/privacy", (req, res) => {
    res.render('privacy');
});

app.get("/contact", (req, res) => {
    res.render('contact');
});

// Blog listing page
app.get("/blog", (req, res) => {
    res.render('blog', { posts: blogPosts });
});

// Individual blog post
app.get("/blog/:slug", (req, res) => {
    const post = blogPosts.find(p => p.slug === req.params.slug);
    if (!post) return res.status(404).send('Post not found');
    const canonical = `https://rateflow.vercel.app/blog/${post.slug}`;
    res.render('blog-post', { post, canonical });
});

// Dynamic sitemap.xml
app.get("/sitemap.xml", (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const toolUrls = [
        // Popular (priority 0.9)
        { loc: '/tool/currency-converter-us-dollar-to-euro/usd-to-eur/', priority: '0.9' },
        { loc: '/tool/currency-converter-euro-to-us-dollar/eur-to-usd/', priority: '0.9' },
        { loc: '/tool/currency-converter-british-pound-to-us-dollar/gbp-to-usd/', priority: '0.9' },
        { loc: '/tool/currency-converter-us-dollar-to-british-pound/usd-to-gbp/', priority: '0.9' },
        // High demand (priority 0.8)
        { loc: '/tool/currency-converter-japanese-yen-to-us-dollar/jpy-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-us-dollar-to-japanese-yen/usd-to-jpy/', priority: '0.8' },
        { loc: '/tool/currency-converter-uae-dirham-to-us-dollar/aed-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-australian-dollar-to-us-dollar/aud-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-pounds-to-dollars/gbp-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-aed-to-usd/aed-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-aud-to-usd/aud-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-british-pound-to-usd/gbp-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-dollars-to-pounds/usd-to-gbp/', priority: '0.8' },
        { loc: '/tool/currency-converter-euros-to-us-dollars/eur-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-cad-to-usd/cad-to-usd/', priority: '0.8' },
        { loc: '/tool/currency-converter-jpy-to-usd/jpy-to-usd/', priority: '0.8' },
        // Middle East & Asia (priority 0.7)
        { loc: '/tool/currency-converter-dirham-to-usd/aed-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-dubai-to-usd/aed-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-cny-to-usd/cny-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-dollar-to-rupee/usd-to-inr/', priority: '0.7' },
        { loc: '/tool/currency-converter-dollar-to-yen/usd-to-jpy/', priority: '0.7' },
        { loc: '/tool/currency-converter-baht-to-usd/thb-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-hkd-to-usd/hkd-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-sgd-to-usd/sgd-to-usd/', priority: '0.7' },
        // Europe & Americas (priority 0.7)
        { loc: '/tool/currency-converter-euro-to-pound/eur-to-gbp/', priority: '0.7' },
        { loc: '/tool/currency-converter-chf-to-usd/chf-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-brazil-to-usd/brl-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-cop-to-usd/cop-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-costa-rica-to-usd/crc-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-dkk-to-usd/dkk-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-egp-to-usd/egp-to-usd/', priority: '0.7' },
        { loc: '/tool/currency-converter-huf-to-usd/huf-to-usd/', priority: '0.7' },
        // Other converters (priority 0.6)
        { loc: '/tool/currency-converter-jmd-to-usd/jmd-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-ghana-to-usd/ghs-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-dollars-to-pesos/usd-to-mxn/', priority: '0.6' },
        { loc: '/tool/currency-converter-dollars-to-euros/usd-to-eur/', priority: '0.6' },
        { loc: '/tool/currency-converter-from-euro-to-usd/eur-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-rub-to-usd/rub-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-uah-to-usd/uah-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-pln-to-usd/pln-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-ron-to-usd/ron-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-czk-to-usd/czk-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-pkr-to-usd/pkr-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-bdt-to-usd/bdt-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-lkr-to-usd/lkr-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-npr-to-usd/npr-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-sar-to-usd/sar-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-qar-to-usd/qar-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-ils-to-usd/ils-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-try-to-usd/try-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-ars-to-usd/ars-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-clp-to-usd/clp-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-pen-to-usd/pen-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-uyu-to-usd/uyu-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-nzd-to-usd/nzd-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-fjd-to-usd/fjd-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-pgk-to-usd/pgk-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-sek-to-usd/sek-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-nok-to-usd/nok-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-isk-to-usd/isk-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-usd-to-euro/usd-to-eur/', priority: '0.6' },
        { loc: '/tool/currency-converter-usd-to-inr/usd-to-inr/', priority: '0.6' },
        { loc: '/tool/currency-converter-usd-to-pkr/usd-to-pkr/', priority: '0.6' },
        { loc: '/tool/currency-converter-usd-to-yen/usd-to-jpy/', priority: '0.6' },
        { loc: '/tool/currency-converter-usd-to-peso/usd-to-mxn/', priority: '0.6' },
        { loc: '/tool/currency-converter-euro-to-inr/eur-to-inr/', priority: '0.6' },
        { loc: '/tool/currency-converter-euro-to-gbp/eur-to-gbp/', priority: '0.6' },
        { loc: '/tool/currency-converter-euro-to-aed/eur-to-aed/', priority: '0.6' },
        { loc: '/tool/currency-converter-euro-to-cad/eur-to-cad/', priority: '0.6' },
        { loc: '/tool/currency-converter-gbp-to-inr/gbp-to-inr/', priority: '0.6' },
        { loc: '/tool/currency-converter-gbp-to-eur/gbp-to-eur/', priority: '0.6' },
        { loc: '/tool/currency-converter-gbp-to-aed/gbp-to-aed/', priority: '0.6' },
        { loc: '/tool/currency-converter-gbp-to-pkr/gbp-to-pkr/', priority: '0.6' },
        { loc: '/tool/currency-converter-aed-to-inr/aed-to-inr/', priority: '0.6' },
        { loc: '/tool/currency-converter-sar-to-inr/sar-to-inr/', priority: '0.6' },
        { loc: '/tool/currency-converter-qar-to-inr/qar-to-inr/', priority: '0.6' },
        { loc: '/tool/currency-converter-rm-to-usd/myr-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-ngn-to-usd/ngn-to-usd/', priority: '0.6' },
        { loc: '/tool/currency-converter-zar-to-usd/zar-to-usd/', priority: '0.6' },
    ];

    const base = 'https://rateflow.vercel.app';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Blog posts
    blogPosts.forEach(post => {
        xml += `
  <url>
    <loc>${base}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Tool pages
    toolUrls.forEach(u => {
        xml += `
  <url>
    <loc>${base}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
    });

    // Static pages
    ['about', 'privacy', 'contact'].forEach(page => {
        xml += `
  <url>
    <loc>${base}/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
});

// Tool pages — handle url like /tool/currency-converter-pounds-to-dollars?from=gbp&to=usd
app.get("/tool/:description/:slug", (req, res) => {
    const { slug } = req.params;
    const [from, to] = slug.split("-to-");

    const fromUpper = from?.toUpperCase() || 'USD';
    const toUpper = to?.toUpperCase() || 'EUR';

    const title = `Convert ${fromUpper} to ${toUpper} | Currency Converter – RateFlow`;
    const metaDescription = `Convert ${fromUpper} to ${toUpper} instantly with live exchange rates on RateFlow. Free, accurate, and updated every minute. No registration required.`;
    const hading = `${fromUpper} to ${toUpper} Currency Converter`;
    const peragraph = `Get live ${fromUpper} to ${toUpper} exchange rates and convert instantly. RateFlow uses real-time mid-market rates so you always get an accurate conversion.`;
    const canonical = `https://rateflow.vercel.app/tool/${req.params.description}/${slug}/`;
    const keywords = `${fromUpper} to ${toUpper}, ${from} to ${to}, currency converter, exchange rates, convert ${from} to ${to}, ${fromUpper} ${toUpper} exchange rate`;

    res.render('tool', {
        title,
        metaDescription,
        hading,
        peragraph,
        canonical,
        keywords,
        fromCurrency: fromUpper,
        toCurrency: toUpper
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
