// ═══════════════════════════════════════════════════════════════
// ROBLOX AI ENGINE V3 - BM25 + ذكاء متقدم
// ═══════════════════════════════════════════════════════════════

class RobloxAI {
    constructor() {
        this.knowledge = this.loadKnowledge();
        this.conversationHistory = [];
        this.patterns = this.loadPatterns();
        this.learningEnabled = true;
        this.cache = {};
        this.bm25 = new BM25Search();
        this.buildSearchIndex();
    }

    loadKnowledge() {
        try {
            const saved = localStorage.getItem('roblox_ai_knowledge_v3');
            const base = JSON.parse(JSON.stringify(KNOWLEDGE_BASE));
            if (saved) {
                const custom = JSON.parse(saved);
                for (const key in custom) {
                    if (!base[key]) base[key] = {};
                    if (typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
                        for (const k2 in custom[key]) base[key][k2] = custom[key][k2];
                    } else {
                        base[key] = custom[key];
                    }
                }
            }
            return base;
        } catch (e) {
            return JSON.parse(JSON.stringify(KNOWLEDGE_BASE));
        }
    }

    saveKnowledge() {
        try {
            const custom = {};
            for (const section in this.knowledge) {
                if (section === 'training_data' || section === 'user_learned' || section === 'verified_facts') {
                    custom[section] = this.knowledge[section];
                }
            }
            localStorage.setItem('roblox_ai_knowledge_v3', JSON.stringify(custom));
        } catch (e) {}
    }

    loadPatterns() {
        try {
            const s = localStorage.getItem('roblox_ai_patterns_v3');
            return s ? JSON.parse(s) : [];
        } catch (e) { return []; }
    }

    savePatterns() {
        try { localStorage.setItem('roblox_ai_patterns_v3', JSON.stringify(this.patterns.slice(-1000))); } catch (e) {}
    }

    // ═══════════════════════════════════════════
    // بناء فهرس البحث BM25
    // ═══════════════════════════════════════════

    buildSearchIndex() {
        // إضافة الكلمات المفتاحية
        for (const [k, v] of Object.entries(this.knowledge.luau_keywords || {})) {
            this.bm25.addDocument({ id: 'kw_' + k, type: 'keyword', title: k, text: v, category: 'luau' });
        }
        // إضافة أنواع البيانات
        for (const [k, v] of Object.entries(this.knowledge.data_types || {})) {
            this.bm25.addDocument({ id: 'dt_' + k, type: 'datatype', title: k, text: v, category: 'datatypes' });
        }
        // إضافة API
        for (const [k, v] of Object.entries(this.knowledge.roblox_api || {})) {
            const text = (v.desc || '') + ' ' + (v.properties || '') + ' ' + (v.methods || '');
            this.bm25.addDocument({ id: 'api_' + k, type: 'api', title: k, text, code: v.example, category: 'api' });
        }
        // إضافة الأنماط الشائعة
        for (const [k, v] of Object.entries(this.knowledge.common_patterns || {})) {
            this.bm25.addDocument({ id: 'pat_' + k, type: 'pattern', title: k.replace(/_/g, ' '), text: v.desc || '', code: v.code, category: 'patterns' });
        }
        // إضافة أنماط الألعاب
        for (const [k, v] of Object.entries(this.knowledge.game_patterns || {})) {
            this.bm25.addDocument({ id: 'game_' + k, type: 'game_pattern', title: k.replace(/_/g, ' '), text: v.desc || '', code: v.code, category: 'game_patterns' });
        }
        // إضافة المراجع
        if (typeof REFERENCE_DATA !== 'undefined') {
            for (const [cat, refs] of Object.entries(REFERENCE_DATA)) {
                for (const ref of refs) {
                    this.bm25.addDocument({ id: 'ref_' + cat + '_' + ref.name, type: 'reference', title: ref.name, text: ref.desc, code: ref.code, category: 'reference' });
                }
            }
        }
        // إضافة الدروس
        if (typeof LESSONS_DATA !== 'undefined') {
            for (const [cat, lessons] of Object.entries(LESSONS_DATA)) {
                for (const lesson of lessons) {
                    this.bm25.addDocument({ id: 'lesson_' + cat + '_' + lesson.title, type: 'lesson', title: lesson.title, text: lesson.desc, category: 'lessons' });
                }
            }
        }
        // إضافة المعرفة المكتسبة من البحث
        for (const [key, data] of Object.entries(this.knowledge.training_data || {})) {
            this.bm25.addDocument({
                id: 'learned_' + key,
                type: 'learned',
                title: data.title || data.query,
                text: data.desc || data.query,
                code: data.code,
                category: 'learned'
            });
        }
        // إضافة المعرفة المكتسبة من اللاعبين
        if (typeof playerLearning !== 'undefined' && playerLearning) {
            for (const pair of playerLearning.data.qnaPairs || []) {
                this.bm25.addDocument({ id: 'player_' + Math.random(), type: 'player', title: pair.q, text: pair.a, category: 'player_learned' });
            }
        }
        // إضافة المعرفة المكتسبة ذاتياً
        if (typeof learningEngine !== 'undefined' && learningEngine) {
            for (const [topic, data] of Object.entries(learningEngine.knowledgeIndex || {})) {
                const text = data.entries.map(e => e.content).join(' ');
                this.bm25.addDocument({ id: 'self_' + topic, type: 'self_learned', title: topic, text, category: 'self_learned' });
            }
        }

        this.bm25.buildIndex();
    }

    rebuildIndex() {
        this.bm25 = new BM25Search();
        this.buildSearchIndex();
    }

    // ═══════════════════════════════════════════
    // البحث من السيرفر (Zahf)
    // ═══════════════════════════════════════════

    async crawlFromServer(url) {
        try {
            const res = await fetch('/api/crawl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            return await res.json();
        } catch (e) {
            return { status: 'error', error: e.message };
        }
    }

    async crawlBatch(urls) {
        try {
            const res = await fetch('/api/crawl-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls })
            });
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async searchServer(query) {
        try {
            const res = await fetch('/api/search?q=' + encodeURIComponent(query));
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async getServerPages() {
        try {
            const res = await fetch('/api/pages');
            return await res.json();
        } catch (e) {
            return { count: 0, pages: [] };
        }
    }

    async deleteServerPages() {
        try {
            await fetch('/api/pages', { method: 'DELETE' });
        } catch (e) {}
    }

    // ═══════════════════════════════════════════
    // البحث المدمج (كل المصادر + تصفية)
    // ═══════════════════════════════════════════

    async smartSearch(msg) {
        const lo = msg.toLowerCase();

        // 1. بحث محلي BM25
        const local = this.bm25.search(msg, 8, 0.05);

        // 2. بحث سيرفر (الوثائق المحفوظة)
        const server = await this.searchServer(msg);

        // 3. بحث مباشر في المعرفة (fallback)
        const directResult = this.directSearch(msg);

        // 4. بحث في الدروس
        const lessonResult = this.searchLessons(msg);

        // 5. بحث في المراجع
        const refResult = this.searchReference(msg);

        // ═══════ تصفية ودمج النتائج ═══════

        // نجمع كل النتائج
        let allResults = [];

        // BM25 results
        for (const r of local) {
            allResults.push({
                title: r.title,
                desc: r.text,
                code: r.code,
                score: r.score || 0,
                source: 'database',
                category: r.category
            });
        }

        // Direct search
        if (directResult) {
            allResults.push({
                title: directResult.title,
                desc: directResult.desc,
                code: directResult.code,
                score: 1.0,
                source: 'direct',
                properties: directResult.properties,
                methods: directResult.methods
            });
        }

        // Lessons
        if (lessonResult) {
            allResults.push({
                title: lessonResult.title,
                desc: lessonResult.desc,
                score: 0.8,
                source: 'lesson'
            });
        }

        // References
        for (const r of (refResult || []).slice(0, 3)) {
            allResults.push({
                title: r.name,
                desc: r.desc,
                code: r.code,
                score: 0.7,
                source: 'reference'
            });
        }

        // ═══════ دمج وتجميع ═══════

        const merged = this.mergeResults(allResults);

        // ═══════ حفظ أفضل نتيجة للمستقبل ═══════

        if (merged.length > 0 && merged[0].sources >= 2) {
            this.saveLearnedFact(msg, merged[0]);
        }

        // ═══════ بناء الإجابة ═══════

        let text = '';
        let code = null;
        let hasCode = false;

        if (merged.length > 0) {
            const top = merged[0];

            // العنوان الرئيسي
            text = `📚 **${top.title}**\n\n${top.desc}`;

            // الكود
            if (top.code) {
                code = top.code;
                hasCode = true;
            }

            // الخصائص والدوال
            if (top.properties) {
                text += `\n\n**الخصائص:**\n\`${top.properties}\``;
            }
            if (top.methods) {
                text += `\n\n**الدوال:**\n\`${top.methods}\``;
            }

            // عدد المصادر الداعمة
            if (top.sources > 1) {
                text += `\n\n> ✅ هذه المعلومة مدعومة من ${top.sources} مصادر`;
            }

            // نتائج إضافية
            if (merged.length > 1) {
                text += '\n\n---\n**نتائج ذات صلة:**\n';
                for (const r of merged.slice(1, 4)) {
                    text += `- **${r.title}**: ${(r.desc || '').substring(0, 100)}...\n`;
                }
            }
        }

        // الوثائق
        if (server.length > 0) {
            text += '\n\n---\n📄 **من الوثائق:**\n';
            for (const r of server.slice(0, 2)) {
                text += `📄 [${r.url}](${r.url})\n${(r.excerpt || '').substring(0, 200)}...\n\n`;
            }
        }

        // لا نتائج
        if (!text) {
            text = `🔍 **ما لقيت نتيجة دقيقة لسؤالك**\n\n**جرب:**
- كتابة الكلمات بشكل أوضح
- استخدام كلمات مفتاحية مثل: Part, TweenService, DataStore
- سؤال عن موضوع محدد

**أو اطلب كود مباشرة:**
- "اكتب نظام بنك"
- "اكتب GUI احترافي"`;
        }

        return {
            text,
            type: (merged.length > 0 || server.length > 0) ? 'search_result' : 'no_result',
            hasCode,
            code,
            source: 'multi_search'
        };
    }

    // ═══════════════════════════════════════════
    // دمج وتجميع النتائج المشابهة
    // ═══════════════════════════════════════════

    mergeResults(results) {
        if (results.length === 0) return [];

        // ترتيب حسب النقاط
        results.sort((a, b) => (b.score || 0) - (a.score || 0));

        // دمج النتائج المشابهة
        const merged = [];
        const used = new Set();

        for (let i = 0; i < results.length; i++) {
            if (used.has(i)) continue;

            const current = results[i];
            let sources = 1;
            let bestDesc = current.desc;
            let bestCode = current.code;

            // ابحث عن نتائج مشابهة
            for (let j = i + 1; j < results.length; j++) {
                if (used.has(j)) continue;
                const other = results[j];

                // إذا كانوا عن نفس الشيء
                if (this.areSimilar(current.title, other.title)) {
                    sources++;
                    used.add(j);
                    // نستخدم الأطول والأشمل
                    if (other.desc && other.desc.length > bestDesc.length) {
                        bestDesc = other.desc;
                    }
                    if (other.code && !bestCode) {
                        bestCode = other.code;
                    }
                }
            }

            merged.push({
                title: current.title,
                desc: bestDesc,
                code: bestCode,
                score: current.score,
                sources: sources,
                properties: current.properties,
                methods: current.methods
            });

            used.add(i);
        }

        return merged;
    }

    // ═══════════════════════════════════════════
    // تحقق: هل هما عن نفس الشيء؟
    // ═══════════════════════════════════════════

    areSimilar(title1, title2) {
        if (!title1 || !title2) return false;
        const t1 = title1.toLowerCase().trim();
        const t2 = title2.toLowerCase().trim();

        // مطابقة مباشرة
        if (t1 === t2) return true;

        // واحد يحتوي على الآخر
        if (t1.includes(t2) || t2.includes(t1)) return true;

        // حساب التشابه
        const words1 = t1.split(/\s+/);
        const words2 = t2.split(/\s+/);
        let common = 0;
        for (const w of words1) {
            if (words2.includes(w)) common++;
        }
        const similarity = common / Math.max(words1.length, words2.length);
        return similarity > 0.5;
    }

    // ═══════════════════════════════════════════
    // حفظ المعلومة المكتسبة
    // ═══════════════════════════════════════════

    saveLearnedFact(query, result) {
        try {
            // حفظ في training_data
            if (!this.knowledge.training_data) this.knowledge.training_data = {};

            const key = this.bm25.normalize(query).replace(/\s+/g, '_');
            if (!this.knowledge.training_data[key]) {
                this.knowledge.training_data[key] = {
                    query: query,
                    title: result.title,
                    desc: result.desc,
                    code: result.code,
                    sources: result.sources,
                    time: Date.now(),
                    learnedFrom: 'search'
                };
                this.saveKnowledge();

                // إعادة بناء الفهرس
                this.bm25.addDocument({
                    id: 'learned_' + key,
                    type: 'learned',
                    title: result.title,
                    text: result.desc,
                    code: result.code,
                    category: 'learned'
                });
                this.bm25.buildIndex();
            }
        } catch (e) {}
    }

    // ═══════════════════════════════════════════
    // جلب المعرفة المكتسبة
    // ═══════════════════════════════════════════

    getLearnedFacts() {
        try {
            return this.knowledge.training_data || {};
        } catch (e) {
            return {};
        }
    }

    // ═══════════════════════════════════════════
    // إحصائيات التعلم
    // ═══════════════════════════════════════════

    getLearningStats() {
        const facts = this.getLearnedFacts();
        return {
            totalFacts: Object.keys(facts).length,
            categories: {
                search: Object.values(facts).filter(f => f.learnedFrom === 'search').length,
                user: Object.values(facts).filter(f => f.learnedFrom === 'user').length,
                crawled: Object.values(facts).filter(f => f.learnedFrom === 'crawled').length
            }
        };
    }

    // ═══════════════════════════════════════════
    // بحث مباشر في المعرفة
    // ═══════════════════════════════════════════

    directSearch(msg) {
        const lo = msg.toLowerCase();
        const api = this.knowledge.roblox_api || {};
        const kw = this.knowledge.luau_keywords || {};
        const dt = this.knowledge.data_types || {};

        // ابحث في API
        for (const [name, data] of Object.entries(api)) {
            if (lo.includes(name.toLowerCase()) || lo.includes(name.replace(/([A-Z])/g, ' $1').toLowerCase())) {
                return { ...data, title: name, type: 'api' };
            }
        }

        // ابحث في الكلمات المفتاحية
        for (const [name, desc] of Object.entries(kw)) {
            if (lo.includes(name.toLowerCase())) {
                return { title: name, desc, type: 'keyword' };
            }
        }

        // ابحث في أنواع البيانات
        for (const [name, desc] of Object.entries(dt)) {
            if (lo.includes(name.toLowerCase())) {
                return { title: name, desc, type: 'datatype' };
            }
        }

        return null;
    }

    // ═══════════════════════════════════════════
    // بحث في الدروس
    // ═══════════════════════════════════════════

    searchLessons(msg) {
        if (typeof LESSONS_DATA === 'undefined') return null;
        const lo = msg.toLowerCase();
        for (const [cat, lessons] of Object.entries(LESSONS_DATA)) {
            for (const lesson of lessons) {
                if (lo.includes(lesson.title.toLowerCase()) || lo.includes(cat.toLowerCase())) {
                    return lesson;
                }
            }
        }
        return null;
    }

    // ═══════════════════════════════════════════
    // بحث في المراجع
    // ═══════════════════════════════════════════

    searchReference(msg) {
        if (typeof REFERENCE_DATA === 'undefined') return [];
        const lo = msg.toLowerCase();
        const results = [];
        for (const [cat, refs] of Object.entries(REFERENCE_DATA)) {
            for (const ref of refs) {
                if (lo.includes(ref.name.toLowerCase()) || lo.includes(cat.toLowerCase())) {
                    results.push(ref);
                }
            }
        }
        return results.slice(0, 5);
    }

    // ═══════════════════════════════════════════
    // كشف النية
    // ═══════════════════════════════════════════

    detectIntent(original) {
        const lo = original.toLowerCase();
        const norm = this.bm25.normalize(original);

        // تحية
        if (/^(مرحبا|هلا|السلام|صباح|مساء|أهلا|أهلين|هاي|هلو|yo|hi|hello|hey|السلام عليكم)/i.test(norm)) {
            return { type: 'greeting', confidence: 0.95 };
        }

        // طلب إنشاء كود
        if (/(اكتب|عمل|صمم|سو|جيب|انشئ|สร้าง|build|create|write|make|generate|code|script|كتب|ابنيلي|سوي|سويلي|جيبة|كتبل|عمليلي|صمميلي|ابغى|ابي|بدي|عايز|حابب)/i.test(norm)) {
            return { type: 'code_request', confidence: 0.9 };
        }

        // شرح
        if (/(اشرح|شرح|فسر|وضّح|explain|what is|what are|how does|ليش|لماذا|لية|why|how|كيف|شو هو|شو هي|ما معنى|يعني ايه|ايه هو|ابغى اعرف|ابي اعرف|بدي اعرف|عايز اعرف|حابب اعرف|tell me about|INFO عن|معلومات عن)/i.test(norm)) {
            return { type: 'explain', confidence: 0.85 };
        }

        // إصلاح
        if (/(اصلاح|حل|fix|bug|error|مشكلة|غلط|خطأ|troubleshoot|debug|ما بيشتغل|في مشكله|الكود خربان|الكود ما شغال|خربان|ما شغال)/i.test(norm)) {
            return { type: 'fix', confidence: 0.85 };
        }

        // تحسين
        if (/(تحسين|improve|optimize|better|افضل|احسن|enhance|upgrade|طور|حسّن|خلي احسن)/i.test(norm)) {
            return { type: 'improve', confidence: 0.8 };
        }

        // درس
        if (/(درس|tutorial|learn|تعلم|teach|دورة|course|ابدأ|ابدئ|بدي اتعلم|ابدئ)/i.test(norm)) {
            return { type: 'tutorial', confidence: 0.8 };
        }

        // قائمة
        if (/(قائمة|list|all|كل|show me|وريني|عايز اشوف|حابب اشوف)/i.test(norm)) {
            return { type: 'list', confidence: 0.8 };
        }

        // مقارنة
        if (/(فرق|compare|difference|ايه الفرق|شو الفرق|احسن|افضل|entre|أفضل من|احسن من)/i.test(norm)) {
            return { type: 'compare', confidence: 0.75 };
        }

        // أفضل ممارسة
        if (/(افضل طريقة|best practice|طريقة صحيحة|صح|خطة|plan|كيف ابدأ|ابدأ من وين)/i.test(norm)) {
            return { type: 'best_practice', confidence: 0.75 };
        }

        // تصحيح من اللاعب
        if (/(اتعلم|تعلم من|new info|معلومة جديدة|correct|صحح|this is wrong|غلط|الصحيح|ال正确)/i.test(norm)) {
            return { type: 'learn_from_user', confidence: 0.8 };
        }

        // سؤال بسيط → شرح
        if (original.includes('؟') || original.includes('?')) {
            return { type: 'explain', confidence: 0.7 };
        }

        // نص قصير بدون مسافات → اسم كلاس
        if (original.length < 30 && !original.includes(' ')) {
            return { type: 'explain', confidence: 0.6 };
        }

        // افتراضي: بحث معرفة
        return { type: 'search', confidence: 0.5 };
    }

    // ═══════════════════════════════════════════
    // استخراج الكيانات
    // ═══════════════════════════════════════════

    extractEntities(text) {
        const e = { classes: [], services: [], features: [], keywords: [] };
        const lo = text.toLowerCase();

        const allFeatures = {
            'بنك': 'bank', 'فلوس': 'coins', 'عملات': 'coins', 'نقود': 'coins',
            'متجر': 'shop', 'شراء': 'shop', 'بيع': 'shop',
            'level': 'level', 'ليفل': 'level', 'ترقيه': 'level', 'مستوى': 'level',
            'قتال': 'combat', 'هجوم': 'combat',
            'حقيبه': 'inventory', 'حقيبة': 'inventory', 'امتعه': 'inventory',
            'مؤقت': 'timer', 'عداد': 'timer', 'وقت': 'timer',
            'rainbow': 'rainbow', 'قوس قزح': 'rainbow',
            'انفجار': 'explosion',
            'قتل': 'kill', 'موت': 'kill',
            'noclip': 'noclip', 'اختراق': 'noclip',
            'سرعه': 'speed', 'سرعة': 'speed',
            'نط': 'jump', 'قفز': 'jump',
            'طيران': 'fly', 'fly': 'fly',
            'لوحة صداره': 'leaderboard', 'لوحة صدارة': 'leaderboard',
            'شات': 'chat', 'محادثه': 'chat',
            'حوار': 'dialog', 'npc': 'dialog',
            'تيلي بورت': 'teleport', 'نقل': 'teleport',
            'gamepass': 'gamepass', 'vip': 'vip',
            'سياره': 'vehicle', 'مركبه': 'vehicle',
            'اداة': 'tool', 'أداة': 'tool',
            'door': 'door', 'باب': 'door',
            'wall': 'wall', 'جدار': 'wall',
            'trap': 'trap', 'فخ': 'trap',
            'lobby': 'lobby', 'لوبي': 'lobby',
            'round': 'round', 'جولة': 'round',
            'team': 'team', 'فريق': 'team',
            'pvp': 'pvp',
            'fishing': 'fishing', 'صيد': 'fishing',
            'mining': 'mining', 'تعدين': 'mining',
            'crafting': 'crafting', 'تصنيع': 'crafting',
            'pet': 'pet', 'حيوان': 'pet',
        };

        const allServices = {
            'tween': 'TweenService', 'tweenservice': 'TweenService', 'حركه': 'TweenService', 'حركة': 'TweenService',
            'datastore': 'DataStoreService', 'حفظ بيانات': 'DataStoreService', 'بيانات': 'DataStoreService',
            'remote': 'RemoteEvent', 'ريموت': 'RemoteEvent',
            'players': 'Players', 'لاعبين': 'Players',
            'pathfinding': 'PathfindingService', 'مسار': 'PathfindingService',
            'collection': 'CollectionService', 'تجميع': 'CollectionService',
            'marketplace': 'MarketplaceService', 'متجر': 'MarketplaceService',
            'teleport': 'TeleportService',
            'lighting': 'Lighting', 'جو': 'Lighting',
            'runservice': 'RunService', 'run': 'RunService',
            'input': 'UserInputService', 'لوحة مفاتيح': 'UserInputService',
            'http': 'HttpService',
            'debris': 'Debris', 'حذف': 'Debris',
            'workspace': 'Workspace',
        };

        for (const [k, v] of Object.entries(allFeatures)) { if (lo.includes(k)) e.features.push(v); }
        for (const [k, v] of Object.entries(allServices)) { if (lo.includes(k)) e.services.push(v); }

        e.features = [...new Set(e.features)];
        e.services = [...new Set(e.services)];
        return e;
    }

    // ═══════════════════════════════════════════
    // المعالجة الرئيسية
    // ═══════════════════════════════════════════

    async processMessage(userMessage) {
        const t0 = performance.now();
        this.conversationHistory.push({ role: 'user', content: userMessage, time: Date.now() });

        const intent = this.detectIntent(userMessage);
        const entities = this.extractEntities(userMessage);

        let response;

        switch (intent.type) {
            case 'greeting': response = this.genGreeting(userMessage); break;
            case 'code_request': response = this.genCode(userMessage, entities); break;
            case 'explain': response = await this.genExplanation(userMessage); break;
            case 'fix': response = this.genFix(userMessage); break;
            case 'improve': response = this.genImprove(userMessage); break;
            case 'tutorial': response = await this.genTutorial(userMessage); break;
            case 'list': response = this.genList(); break;
            case 'compare': response = this.genComparison(userMessage); break;
            case 'best_practice': response = this.genBestPractice(userMessage); break;
            case 'learn_from_user': response = this.learnFromUser(userMessage); break;
            case 'search': response = await this.smartSearch(userMessage); break;
            default: response = await this.smartSearch(userMessage);
        }

        if (this.learningEnabled) this.learn(userMessage, intent);
        this.conversationHistory.push({ role: 'ai', content: response.text, time: Date.now() });
        response.meta = { time: Math.round(performance.now() - t0), intent: intent.type, confidence: intent.confidence };
        return response;
    }

    // ═══════════════════════════════════════════
    // البحث BM25 الرئيسي
    // ═══════════════════════════════════════════

    bm25Search(msg) {
        const results = this.bm25.search(msg, 5, 0.05);

        if (results.length === 0) {
            return {
                text: `🔍 **ما لقيت نتيجة دقيقة لسؤالك**\n\n**جرب:**
- كتابة الكلمات بشكل أوضح
- استخدام كلمات مفتاحية مثل: TweenService, DataStore, Part, GUI
- سؤال عن موضوع محدد مثل: "كيف أحفظ بيانات اللاعبين"

**أو اطلب كود مباشرة:**
- "اكتب نظام بنك"
- "اكتب GUI احترافي"`,
                type: 'no_result',
                hasCode: false,
                coverage: 0
            };
        }

        const top = results[0];
        const coverage = this.bm25.hasCoverage(msg, top);

        if (!coverage) {
            return {
                text: `🔍 **ما لقيت نتيجة دقيقة**\n\nأقرب نتيجة: **${top.title}**\nلكن ما فيها تغطية كافية لسؤالك.\n\n**حاول:**
- تغيير الكلمات
- أو اكتب السؤال بشكل أوضح`,
                type: 'low_coverage',
                hasCode: false,
                coverage: 0
            };
        }

        let text = `📚 **${top.title}**\n\n${top.text}`;
        if (top.code) {
            text += `\n\n\`\`\`lua\n${top.code}\n\`\`\``;
        }

        if (results.length > 1) {
            text += '\n\n---\n**نتائج أخرى:**\n';
            for (const r of results.slice(1, 3)) {
                text += `- **${r.title}**: ${r.text.substring(0, 100)}...\n`;
            }
        }

        return {
            text,
            type: 'search_result',
            hasCode: !!top.code,
            code: top.code,
            score: top.score,
            coverage,
            source: top.type
        };
    }

    // ═══════════════════════════════════════════
    // توليد الكود
    // ═══════════════════════════════════════════

    genCode(msg, ent) {
        const f = ent.features;
        const lo = msg.toLowerCase();

        if (f.includes('bank') || f.includes('coins') || lo.includes('بنك')) return this.makeCode('bank', CODE_BANK, '🏦 نظام بنك كامل');
        if (f.includes('shop') || lo.includes('متجر')) return this.makeCode('shop', CODE_SHOP, '🛒 نظام متجر');
        if (f.includes('level') || lo.includes('ليفل') || lo.includes('مستوى')) return this.makeCode('level', CODE_LEVEL, '📈 نظام ليفل و XP');
        if (f.includes('combat') || lo.includes('قتال')) return this.makeCode('combat', CODE_COMBAT, '⚔️ نظام قتال');
        if (f.includes('inventory') || lo.includes('حقيبة')) return this.makeCode('inventory', CODE_INVENTORY, '🎒 نظام حقيبة');
        if (f.includes('teleport') || lo.includes('نقل')) return this.makeCode('teleport', CODE_TELEPORT, '🚀 نظام النقل');
        if (f.includes('timer') || lo.includes('مؤقت') || lo.includes('عداد')) return this.makeCode('timer', CODE_TIMER, '⏱️ نظام مؤقت');
        if (f.includes('dialog') || lo.includes('محادثة') || lo.includes('حوار') || lo.includes('npc')) return this.makeCode('dialog', CODE_DIALOG, '💬 نظام محادثة');
        if (f.includes('rainbow')) return this.makeCode('rainbow', CODE_RAINBOW, '🌈 جسيم قوس قزح');
        if (f.includes('kill') || lo.includes('قتل')) return this.makeCode('kill', CODE_KILL, '💀 جسيم القتل');
        if (f.includes('noclip')) return this.makeCode('noclip', CODE_NOCLIP, '👻 Noclip');
        if (f.includes('speed')) return this.makeCode('speed', CODE_SPEED, '⚡ تعزيز السرعة');
        if (f.includes('fly') || lo.includes('طيران')) return this.makeCode('fly', CODE_FLY, '✈️ الطيران');
        if (f.includes('leaderboard') || lo.includes('لوحة صدارة')) return this.makeCode('leaderboard', CODE_LEADERBOARD, '🏆 لوحة صدارة');
        if (f.includes('respawn') || lo.includes('إعادة ظهور')) return this.makeCode('respawn', CODE_RESPAWN, '🔄 إعادة الظهور');
        if (f.includes('tool') || lo.includes('أداة')) return this.makeCode('tool', CODE_TOOL, '🔧 أداة تفاعلية');
        if (f.includes('gui') || lo.includes('واجه') || lo.includes('gui')) return this.makeCode('gui', CODE_GUI, '🎮 واجهة GUI احترافية');

        if (ent.services.includes('TweenService') || lo.includes('tween')) return this.makeCode('tween', CODE_TWEEN, '🎬 TweenService');
        if (ent.services.includes('DataStoreService') || lo.includes('datastore')) return this.makeCode('datastore', CODE_DATASTORE, '💾 DataStoreService');
        if (ent.services.includes('RemoteEvent') || lo.includes('remote')) return this.makeCode('remote', CODE_REMOTE, '🔗 RemoteEvents');
        if (ent.services.includes('PathfindingService') || lo.includes('pathfinding')) return this.makeCode('pathfinding', CODE_PATHFINDING, '🛤️ PathfindingService');
        if (ent.services.includes('CollectionService') || lo.includes('collection')) return this.makeCode('collection', CODE_COLLECTION, '🏷️ CollectionService');
        if (ent.services.includes('MarketplaceService') || f.includes('gamepass')) return this.makeCode('gamepass', CODE_GAMEPASS, '🎫 Game Pass');

        return this.bm25Search(msg);
    }

    makeCode(title, code, description) {
        return { text: description || title, type: 'code', hasCode: true, code, language: 'lua' };
    }

    // ═══════════════════════════════════════════
    // شرح
    // ═══════════════════════════════════════════

    async genExplanation(msg) {
        return await this.smartSearch(msg);
    }

    // ═══════════════════════════════════════════
    // إصلاح
    // ═══════════════════════════════════════════

    genFix(msg, ent) {
        const lo = msg.toLowerCase();
        if (lo.includes('nil') || lo.includes('does not exist') || lo.includes('is not a valid')) {
            return { text: `🔧 **حل مشكلة nil / Does not exist**\n\n**الحل:**\n\`\`\`lua\n-- ❌ خطأ:\nlocal part = workspace.Part\n\n-- ✅ الحل 1: WaitForChild\nlocal part = workspace:WaitForChild("Part", 10)\n\n-- ✅ الحل 2: FindFirstChild\nlocal part = workspace:FindFirstChild("Part")\nif part then\n    -- استخدمه\nelse\n    warn("Part not found!")\nend\n\`\`\``, type: 'fix', hasCode: true };
        }
        return { text: `🔧 **حل المشاكل البرمجية**\n\n**الصق الكود الذي به مشكلة وسأساعدك!**\n\n**أمثلة على مشاكل شائعة:**\n1. nil value → استخدم WaitForChild\n2. cannot index → تأكد من أن الكائن موجود\n3. DataStore error → استخدم pcall\n4. Infinite yield → تحقق من المسار`, type: 'fix', hasCode: false };
    }

    // ═══════════════════════════════════════════
    // تحسين
    // ═══════════════════════════════════════════

    genImprove(msg) {
        return { text: `⚡ **تحسين الكود - نصائح احترافية**\n\n**1. pcall للحماية:**\n\`\`\`lua\nlocal ok, err = pcall(function() end)\nif not ok then warn("Error: " .. err) end\n\`\`\`\n\n**2. task بدلاً من wait:**\n\`\`\`lua\ntask.wait(1)\ntask.spawn(function() end)\ntask.delay(5, function() end)\n\`\`\`\n\n**3. typeof بدلاً من type:**\n\`\`\`lua\nprint(typeof(part)) -- "Instance"\n\`\`\``, type: 'improvement', hasCode: false };
    }

    // ═══════════════════════════════════════════
    // درس
    // ═══════════════════════════════════════════

    async genTutorial(msg) {
        return await this.smartSearch(msg);
    }

    // ═══════════════════════════════════════════
    // قائمة
    // ═══════════════════════════════════════════

    genList() {
        return { text: `📋 **أنواع الأكواد المتاحة**\n\n**أنظمة اللعب:**\n1. 🏦 نظام بنك\n2. 🛒 نظام متجر\n3. 📈 نظام ليفل\n4. ⚔️ نظام قتال\n5. 🎒 نظام حقيبة\n6. 💬 نظام محادثة\n7. 🚀 نظام نقل\n8. ⏱️ نظام مؤقت\n\n**أكواد عامة:**\n1. 🎮 واجهة GUI\n2. 🔗 RemoteEvents\n3. 💾 حفظ بيانات\n4. 🏆 لوحة صدارة\n5. 👻 Noclip\n6. ✈️ طيران\n7. ⚡ سرعة\n8. 🌈 ألوان`, type: 'list', hasCode: false };
    }

    // ═══════════════════════════════════════════
    // مقارنة
    // ═══════════════════════════════════════════

    genComparison(msg) {
        return { text: `🔄 **مقارنة بين المفاهيم**\n\n**Script vs LocalScript:**\n- Script: يعمل على الخادم\n- LocalScript: يعمل على جهاز اللاعب\n\n**FindFirstChild vs WaitForChild:**\n- FindFirstChild: يبحث فوراً\n- WaitForChild: ينتظر\n\n**wait vs task.wait:**\n- wait: قديم\n- task.wait: حديث ومضمون`, type: 'comparison', hasCode: false };
    }

    // ═══════════════════════════════════════════
    // أفضل ممارسة
    // ═══════════════════════════════════════════

    genBestPractice(msg) {
        return { text: `✅ **أفضل الممارسات**\n\n**1. تنظيم الكود:**\n\`\`\`lua\nlocal Players = game:GetService("Players")\nlocal RS = game:GetService("ReplicatedStorage")\n\`\`\`\n\n**2. الأمان:**\n\`\`\`lua\npcall(function()\n    store:SetAsync(key, value)\nend)\n\`\`\`\n\n**3. الأداء:**\n\`\`\`lua\ntask.wait(1) -- بدل wait(1)\n\`\`\``, type: 'best_practice', hasCode: false };
    }

    // ═══════════════════════════════════════════
    // تعلم من اللاعب
    // ═══════════════════════════════════════════

    learnFromUser(msg) {
        const parts = msg.split(/[确认| confirms? | صح |正确 | this is | that is |the answer is |正确的|الصحيح]/i);
        if (parts.length > 1) {
            const topic = parts[0].trim();
            const fact = parts[1].trim();
            if (topic && fact) {
                this.addCustomKnowledge(topic, fact, 'user_corrected');
                this.rebuildIndex();
                return { text: `✅ **تم التعلم!**\n\nحفظت: **${topic}**: ${fact}`, type: 'learning', hasCode: false };
            }
        }
        return { text: `📝 **تعليم الذكاء**\n\nاكتب معلومتك مثال:\n"CFrame يمثل الموقع والدوران"\n"الصحيح هو..."`, type: 'learning', hasCode: false };
    }

    // ═══════════════════════════════════════════
    // التعلم
    // ═══════════════════════════════════════════

    learn(msg, intent) {
        this.patterns.push({ msg: msg.substring(0, 200), intent: intent.type, time: Date.now() });
        if (this.patterns.length % 50 === 0) this.savePatterns();
    }

    addCustomKnowledge(topic, data, category) {
        if (!this.knowledge.training_data) this.knowledge.training_data = {};
        this.knowledge.training_data[topic] = { data, category, time: Date.now() };
        this.saveKnowledge();
    }

    getStats() {
        let total = 0;
        for (const section in KNOWLEDGE_BASE) {
            if (typeof KNOWLEDGE_BASE[section] === 'object' && KNOWLEDGE_BASE[section] !== null) {
                total += Object.keys(KNOWLEDGE_BASE[section]).length;
            }
        }
        const custom = this.knowledge.training_data ? Object.keys(this.knowledge.training_data).length : 0;
        let playerLearned = 0;
        if (typeof playerLearning !== 'undefined' && playerLearning) {
            playerLearned = playerLearning.data.qnaPairs ? playerLearning.data.qnaPairs.length : 0;
        }
        let selfLearned = 0;
        if (typeof learningEngine !== 'undefined' && learningEngine) {
            selfLearned = learningEngine.getStats().totalLearned || 0;
        }
        return { total: total + custom + playerLearned + selfLearned, patterns: this.patterns.length, custom, playerLearned, selfLearned };
    }
}
