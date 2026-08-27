// ═══════════════════════════════════════════════════════════════
// ROBLOX AI SERVER - سيرفر Node.js
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ═══════════════════════════════════════════
// قاعدة البيانات البسيطة
// ═══════════════════════════════════════════

const DB_FILE = path.join(__dirname, 'crawled_data.json');

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
    return { pages: [], lastCrawl: null };
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// الزاحف (Crawler)
// ═══════════════════════════════════════════

async function crawlPage(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await response.text();
        const text = cleanHTML(html);
        return { url, text, status: 'success', time: Date.now() };
    } catch (e) {
        return { url, text: '', status: 'error', error: e.message, time: Date.now() };
    }
}

function cleanHTML(html) {
    // شيل scripts
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    // شيل styles
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // شيل tags
    text = text.replace(/<[^>]+>/g, ' ');
    // شيل decode entities
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, ' ');
    // شيل مسافات زائدة
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

// ═══════════════════════════════════════════
// API Endpoints
// ═══════════════════════════════════════════

// صفحة عادية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// جلب صفحة من الإنترنت
app.post('/api/crawl', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });

    const result = await crawlPage(url);
    if (result.status === 'success') {
        const db = loadDB();
        db.pages.push(result);
        db.lastCrawl = new Date().toISOString();
        saveDB(db);
    }
    res.json(result);
});

// جلب صفحات متعددة
app.post('/api/crawl-batch', async (req, res) => {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) return res.status(400).json({ error: 'urls array required' });

    const results = await Promise.all(urls.map(u => crawlPage(u)));
    const db = loadDB();
    results.forEach(r => { if (r.status === 'success') db.pages.push(r); });
    db.lastCrawl = new Date().toISOString();
    saveDB(db);
    res.json(results);
});

// البحث في المحتوى المحفوظ
app.get('/api/search', (req, res) => {
    const q = (req.query.q || '').toLowerCase();
    const db = loadDB();
    const results = db.pages
        .filter(p => p.text.toLowerCase().includes(q))
        .map(p => ({
            url: p.url,
            excerpt: p.text.substring(0, 300) + '...',
            time: p.time
        }))
        .slice(0, 10);
    res.json(results);
});

// عرض كل المحتوى المحفوظ
app.get('/api/pages', (req, res) => {
    const db = loadDB();
    res.json({ count: db.pages.length, lastCrawl: db.lastCrawl, pages: db.pages });
});

// حذف محتوى
app.delete('/api/pages', (req, res) => {
    saveDB({ pages: [], lastCrawl: null });
    res.json({ success: true });
});

// ═══════════════════════════════════════════
// تشغيل السيرفر
// ═══════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`\n🎮 Roblox AI Server شغال على:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   POST /api/crawl       - جلب صفحة`);
    console.log(`   POST /api/crawl-batch - جلب صفحات متعددة`);
    console.log(`   GET  /api/search?q=   - بحث`);
    console.log(`   GET  /api/pages       - عرض المحتوى`);
    console.log(`   DELETE /api/pages     - حذف المحتوى`);
    console.log(`\n🌐 افتح المتصفح على: http://localhost:${PORT}\n`);
});
