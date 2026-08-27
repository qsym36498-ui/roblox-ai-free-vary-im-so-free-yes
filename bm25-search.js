// ═══════════════════════════════════════════════════════════════
// BM25 SEARCH ENGINE - محرك بحث BM25 الذكي
// ═══════════════════════════════════════════════════════════════

class BM25Search {
    constructor(k1 = 1.5, b = 0.75) {
        this.k1 = k1;
        this.b = b;
        this.documents = [];
        this.docCount = 0;
        this.avgDocLength = 0;
        this.idf = {};
        this.docLengths = [];
    }

    // ═══════════════════════════════════════════
    // تطبيع النص العربي
    // ═══════════════════════════════════════════

    normalize(text) {
        let t = text.toLowerCase();
        // شيل التشكيل
        t = t.replace(/[\u0617-\u061A\u064B-\u0652\u0656-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
        // حوّل الهمزات
        t = t.replace(/[أإآءةئ]/g, 'ا');
        t = t.replace(/ة/g, 'ه');
        t = t.replace(/ى/g, 'ي');
        t = t.replace(/ؤ/g, 'و');
        // شيل الرموز
        t = t.replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ');
        // شيل المسافات الزائدة
        t = t.replace(/\s+/g, ' ').trim();
        return t;
    }

    // ═══════════════════════════════════════════
    // تجذيع الكلمات العربية
    // ═══════════════════════════════════════════

    stem(word) {
        if (word.length < 3) return word;
        // شيل Suffixed شائعة
        if (word.endsWith('ات')) word = word.slice(0, -2);
        else if (word.endsWith('ين')) word = word.slice(0, -2);
        else if (word.endsWith('ون')) word = word.slice(0, -2);
        else if (word.endsWith('ان')) word = word.slice(0, -2);
        else if (word.endsWith('ه')) word = word.slice(0, -1);
        else if (word.endsWith('ي')) word = word.slice(0, -1);
        else if (word.endsWith('ة')) word = word.slice(0, -1);
        else if (word.endsWith('ال')) word = word.slice(0, -2);
        else if (word.endsWith('ال')) word = word.slice(0, -2);
        // Prefixes
        if (word.startsWith('ال') && word.length > 4) word = word.slice(2);
        else if (word.startsWith('وال') && word.length > 5) word = word.slice(3);
        else if (word.startsWith('بال') && word.length > 5) word = word.slice(3);
        else if (word.startsWith('كال') && word.length > 5) word = word.slice(3);
        return word;
    }

    tokenize(text) {
        const normalized = this.normalize(text);
        return normalized.split(/\s+/).filter(w => w.length > 1).map(w => this.stem(w));
    }

    // ═══════════════════════════════════════════
    // بناء الفهرس
    // ═══════════════════════════════════════════

    addDocument(doc) {
        const tokens = this.tokenize(doc.text + ' ' + (doc.title || '') + ' ' + (doc.code || ''));
        const freq = {};
        for (const t of tokens) {
            freq[t] = (freq[t] || 0) + 1;
        }
        this.documents.push({
            ...doc,
            tokens,
            freq,
            length: tokens.length
        });
        this.docCount++;
        this.docLengths.push(tokens.length);
        this.avgDocLength = this.docLengths.reduce((a, b) => a + b, 0) / this.docCount;
    }

    buildIndex() {
        const df = {};
        for (const doc of this.documents) {
            const seen = new Set();
            for (const t of doc.tokens) {
                if (!seen.has(t)) {
                    df[t] = (df[t] || 0) + 1;
                    seen.add(t);
                }
            }
        }
        for (const [term, freq] of Object.entries(df)) {
            this.idf[term] = Math.log((this.docCount - freq + 0.5) / (freq + 0.5) + 1);
        }
    }

    // ═══════════════════════════════════════════
    // حساب BM25
    // ═══════════════════════════════════════════

    score(query, doc) {
        const queryTokens = this.tokenize(query);
        let score = 0;
        for (const qt of queryTokens) {
            const tf = doc.freq[qt] || 0;
            const idf = this.idf[qt] || 0;
            const docLen = doc.length;
            const numerator = tf * (this.k1 + 1);
            const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
            let termScore = idf * (numerator / denominator);
            // وزن العنوان 3x
            if (doc.title && this.tokenize(doc.title).includes(qt)) {
                termScore *= 3;
            }
            // وزن الكود 2x
            if (doc.code && this.tokenize(doc.code).includes(qt)) {
                termScore *= 2;
            }
            score += termScore;
        }
        return score;
    }

    search(query, limit = 5, minScore = 0.1) {
        if (this.documents.length === 0) return [];

        const results = this.documents.map(doc => ({
            ...doc,
            score: this.score(query, doc)
        }))
        .filter(r => r.score > minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

        return results;
    }

    hasCoverage(query, topResult) {
        if (!topResult) return false;
        const queryTokens = this.tokenize(query);
        if (queryTokens.length === 0) return true;
        let matched = 0;
        for (const qt of queryTokens) {
            if (topResult.tokens && topResult.tokens.includes(qt)) {
                matched++;
            }
        }
        return (matched / queryTokens.length) >= 0.3;
    }
}
