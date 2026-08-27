// ═══════════════════════════════════════════════════════════════
// PLAYER-DRIVEN LEARNING ENGINE
// يتعلم من كل تفاعل مع اللاعب
// ═══════════════════════════════════════════════════════════════

class PlayerLearningEngine {
    constructor() {
        this.data = this.load();
        this.listeners = [];
    }

    load() {
        try {
            const s = localStorage.getItem('roblox_player_learning_v2');
            return s ? JSON.parse(s) : this.getDefault();
        } catch (e) {
            return this.getDefault();
        }
    }

    getDefault() {
        return {
            conversations: [],
            qnaPairs: [],
            corrections: [],
            topics: {},
            patterns: [],
            stats: {
                totalInteractions: 0,
                questionsAsked: 0,
                correctionsMade: 0,
                topicsExplored: 0,
                codeGenerated: 0,
                smartResponses: 0,
                playerLevel: 'مبتدئ',
                confidence: 0,
                startedAt: Date.now(),
                lastInteraction: null
            }
        };
    }

    save() {
        try {
            localStorage.setItem('roblox_player_learning_v2', JSON.stringify(this.data));
        } catch (e) {}
    }

    onEvent(cb) { this.listeners.push(cb); }
    emit(ev, d) { this.listeners.forEach(l => l(ev, d)); }

    // ═══════════════════════════════════════════
    // التعلم من كل محادثة
    // ═══════════════════════════════════════════

    learnFromConversation(playerMsg, aiResponse, intent) {
        this.data.stats.totalInteractions++;
        this.data.stats.lastInteraction = Date.now();

        // حفظ المحادثة
        this.data.conversations.push({
            q: playerMsg.substring(0, 500),
            a: aiResponse.text ? aiResponse.text.substring(0, 500) : '',
            intent: intent,
            time: Date.now(),
            hasCode: aiResponse.hasCode || false
        });

        // استخراج المواضيع
        const topics = this.extractTopics(playerMsg);
        for (const topic of topics) {
            if (!this.data.topics[topic]) {
                this.data.topics[topic] = { count: 0, firstSeen: Date.now(), lastSeen: Date.now() };
                this.data.stats.topicsExplored++;
            }
            this.data.topics[topic].count++;
            this.data.topics[topic].lastSeen = Date.now();
        }

        // حفظ كزوج سؤال-جابة
        if (playerMsg.length > 10) {
            this.data.qnaPairs.push({
                q: playerMsg.substring(0, 300),
                a: (aiResponse.text || '').substring(0, 300),
                topics: topics,
                time: Date.now()
            });

            // الاحتفاظ بآخر 500 زوج فقط
            if (this.data.qnaPairs.length > 500) {
                this.data.qnaPairs = this.data.qnaPairs.slice(-500);
            }
        }

        if (aiResponse.hasCode) {
            this.data.stats.codeGenerated++;
        }

        // حفظ الأنماط
        this.learnPatterns(playerMsg, intent);

        this.updateConfidence();
        this.save();
        this.emit('learned', { topics, intent });
    }

    // ═══════════════════════════════════════════
    // التعلم من التصحيحات
    // ═══════════════════════════════════════════

    learnFromCorrection(originalQuestion, correction) {
        this.data.stats.correctionsMade++;

        this.data.corrections.push({
            question: originalQuestion.substring(0, 300),
            correction: correction.substring(0, 500),
            time: Date.now()
        });

        // استخراج المواضيع من التصحيح
        const topics = this.extractTopics(correction);
        for (const topic of topics) {
            if (!this.data.topics[topic]) {
                this.data.topics[topic] = { count: 0, firstSeen: Date.now(), lastSeen: Date.now(), corrected: true };
            }
            this.data.topics[topic].count++;
            this.data.topics[topic].corrected = true;
        }

        this.save();
        this.emit('corrected', { topics });
    }

    // ═══════════════════════════════════════════
    // التعلم من الإدخال المباشر
    // ═══════════════════════════════════════════

    learnFromDirectInput(topic, information, category) {
        if (!this.data.topics[topic]) {
            this.data.topics[topic] = { count: 0, firstSeen: Date.now(), lastSeen: Date.now() };
            this.data.stats.topicsExplored++;
        }
        this.data.topics[topic].count++;
        this.data.topics[topic].lastSeen = Date.now();

        this.data.qnaPairs.push({
            q: topic,
            a: information,
            topics: [topic],
            category: category,
            time: Date.now(),
            source: 'direct_input'
        });

        this.save();
        this.emit('direct_learned', { topic, category });
    }

    // ═══════════════════════════════════════════
    // استخراج المواضيع من النص
    // ═══════════════════════════════════════════

    extractTopics(text) {
        const lo = text.toLowerCase();
        const topics = [];
        const topicMap = {
            'cframe': 'CFrame', 'tween': 'TweenService', 'tweening': 'TweenService',
            'remote': 'RemoteEvent', 'datastore': 'DataStore', 'data store': 'DataStore',
            'gui': 'GUI', 'interface': 'GUI', 'واجهة': 'GUI',
            'raycast': 'Raycast', 'ray': 'Raycast', 'تصوير': 'Raycast',
            'pathfinding': 'PathfindingService', 'مسار': 'PathfindingService',
            'humanoid': 'Humanoid', 'شخصية': 'Humanoid', 'character': 'Humanoid',
            'player': 'Players', 'لاعب': 'Players',
            'spawn': 'SpawnLocation', 'ظهور': 'SpawnLocation',
            'tool': 'Tool', 'أداة': 'Tool',
            'sound': 'Sound', 'صوت': 'Sound',
            'light': 'Lighting', 'إضاءة': 'Lighting',
            'camera': 'Camera', 'كاميرا': 'Camera',
            'part': 'Part', 'جسيم': 'Part',
            'model': 'Model', 'موديل': 'Model',
            'script': 'Script', 'سكربت': 'Script',
            'localscript': 'LocalScript', 'سكربت محلي': 'LocalScript',
            'module': 'ModuleScript', 'وحدة': 'ModuleScript',
            'bank': 'BankSystem', 'بنك': 'BankSystem',
            'shop': 'ShopSystem', 'متجر': 'ShopSystem',
            'level': 'LevelSystem', 'ليفل': 'LevelSystem',
            'combat': 'CombatSystem', 'قتال': 'CombatSystem',
            'inventory': 'InventorySystem', 'حقيبة': 'InventorySystem',
            'leaderboard': 'Leaderboard', 'لوحة صدارة': 'Leaderboard',
            'noclip': 'Noclip', 'اختراق': 'Noclip',
            'fly': 'Fly', 'طيران': 'Fly',
            'speed': 'Speed', 'سرعة': 'Speed',
            'respawn': 'Respawn', 'إعادة ظهور': 'Respawn',
            'gamepass': 'GamePass', 'باص': 'GamePass',
            'badge': 'Badge', 'شارة': 'Badge',
            'teleport': 'Teleport', 'نقل': 'Teleport',
            'collection': 'CollectionService', 'تجميع': 'CollectionService',
            'physics': 'Physics', 'فيزياء': 'Physics',
            'ui': 'UI', 'واجهة مستخدم': 'UI',
            'button': 'Button', 'زر': 'Button',
            'frame': 'Frame', 'إطار': 'Frame',
            'text': 'Text', 'نص': 'Text',
            'image': 'Image', 'صورة': 'Image',
            'animation': 'Animation', 'انيميشن': 'Animation',
            'particle': 'Particles', 'جسيمات': 'Particles',
            'trail': 'Trail', 'أثر': 'Trail',
            'beam': 'Beam', 'شعاع': 'Beam',
            'constraint': 'Constraints', 'قيود': 'Constraints',
            'weld': 'Weld', 'ربط': 'Weld',
            'bodyvelocity': 'BodyVelocity', 'سرعة جسم': 'BodyVelocity',
            'bodygyro': 'BodyGyro', 'دوران جسم': 'BodyGyro',
            'alignment': 'Alignment', 'محاذاة': 'Alignment',
            'velocity': 'Velocity', 'سرعة': 'Velocity',
            'force': 'Force', 'قوة': 'Force',
            'torque': 'Torque', 'عزم': 'Torque',
            'matrix': 'Matrix', 'مصفوفة': 'Matrix',
            'vector': 'Vector', 'متجه': 'Vector',
            'color': 'Color', 'لون': 'Color',
            'material': 'Material', 'مادة': 'Material',
            'transparency': 'Transparency', 'شفافية': 'Transparency',
            'collision': 'Collision', 'تصادم': 'Collision',
            'anchor': 'Anchor', 'تثبيت': 'Anchor',
            'size': 'Size', 'حجم': 'Size',
            'position': 'Position', 'موقع': 'Position',
            'rotation': 'Rotation', 'دوران': 'Rotation',
            'scale': 'Scale', 'مقياس': 'Scale',
            'magnitude': 'Magnitude', 'مقدار': 'Magnitude',
            'unit': 'Unit', 'وحدة': 'Unit',
            'lerp': 'Lerp', 'خلط': 'Lerp',
            'slerp': 'Slerp', 'خلط دائري': 'Slerp',
            'lookat': 'LookAt', 'نظر إلى': 'LookAt',
            'fromaxis': 'FromAxis', 'من محور': 'FromAxis',
            'fromeuler': 'FromEuler', 'من أويلر': 'FromEuler',
            'euler': 'Euler', 'أويلر': 'Euler',
            'quaternion': 'Quaternion', 'كواترنيون': 'Quaternion',
            'debug': 'Debug', 'تصحيح': 'Debug',
            'error': 'Error', 'خطأ': 'Error',
            'pcall': 'Pcall', 'حماية': 'Pcall',
            'xpcall': 'Xpcall', 'حماية متقدمة': 'Xpcall',
            'coroutine': 'Coroutine', 'خيط': 'Coroutine',
            'thread': 'Thread', 'خيط': 'Thread',
            'task': 'Task', 'مهمة': 'Task',
            'spawn': 'Spawn', 'إنشاء': 'Spawn',
            'delay': 'Delay', 'تأخير': 'Delay',
            'defer': 'Defer', 'إرجاء': 'Defer',
            'wait': 'Wait', 'انتظار': 'Wait',
            'signal': 'Signal', 'إشارة': 'Signal',
            'event': 'Event', 'حدث': 'Event',
            'connection': 'Connection', 'اتصال': 'Connection',
            'disconnect': 'Disconnect', 'فصل': 'Disconnect',
            'connect': 'Connect', 'ربط': 'Connect',
            'fire': 'Fire', 'إرسال': 'Fire',
            'invoke': 'Invoke', 'استدعاء': 'Invoke',
            'callback': 'Callback', 'استدعاء رجعي': 'Callback',
            'closure': 'Closure', 'إغلاق': 'Closure',
            'upvalue': 'Upvalue', 'قيمة علوية': 'Upvalue',
            'metamethod': 'Metamethod', '-method': 'Metamethod',
            'metatable': 'Metatable', 'جدول':'',
            'index': 'Index', 'فهرس': 'Index',
            'newindex': 'NewIndex', 'فهرس جديد': 'NewIndex',
            'call': 'Call', 'استدعاء': 'Call',
            'add': 'Add', 'جمع': 'Add',
            'sub': 'Sub', 'طرح': 'Sub',
            'mul': 'Mul', 'ضرب': 'Mul',
            'div': 'Div', 'قسمة': 'Div',
            'mod': 'Mod', 'باقي': 'Mod',
            'pow': 'Pow', 'قوة': 'Pow',
            'unm': 'Unm', 'سالب': 'Unm',
            'len': 'Len', 'طول': 'Len',
            'concat': 'Concat', 'ربط': 'Concat',
            'eq': 'Eq', 'يساوي': 'Eq',
            'lt': 'Lt', 'أصغر': 'Lt',
            'le': 'Le', 'أصغر أو يساوي': 'Le',
            'type': 'Type', 'نوع': 'Type',
            'typeof': 'TypeOf', 'نوع القيمة': 'TypeOf',
            ' tostring': 'ToString', 'تحويل لنص': 'ToString',
            'tonumber': 'ToNumber', 'تحويل لرقم': 'ToNumber',
            'rawget': 'RawGet', 'جلب خام': 'RawGet',
            'rawset': 'RawSet', 'ضبط خام': 'RawSet',
            'rawequal': 'RawEqual', 'مقارنة خام': 'RawEqual',
            'select': 'Select', 'اختيار': 'Select',
            'unpack': 'Unpack', 'فتح': 'Unpack',
            'require': 'Require', 'استيراد': 'Require',
            'setmetatable': 'SetMetatable', 'ضبط جدول': 'SetMetatable',
            'getmetatable': 'GetMetatable', 'جلب جدول': 'GetMetatable',
            'setfenv': 'SetFEnv', 'ضبط بيئة': 'SetFEnv',
            'getfenv': 'GetFEnv', 'جلب بيئة': 'GetFEnv',
            'loadstring': 'LoadString', 'تحميل نص': 'LoadString',
            'loadfile': 'LoadFile', 'تحميل ملف': 'LoadFile',
            'dofile': 'DoFile', 'تنفيذ ملف': 'DoFile',
            'pcall': 'Pcall', 'استدعاء آمن': 'Pcall',
            'xpcall': 'Xpcall', 'استدعاء آمن متقدم': 'Xpcall',
            'error': 'Error', 'خطأ': 'Error',
            'assert': 'Assert', 'تأكيد': 'Assert',
            'next': 'Next', 'تالي': 'Next',
            'pairs': 'Pairs', 'أزواج': 'Pairs',
            'ipairs': 'IPairs', 'فهرسة': 'IPairs',
            'rawget': 'RawGet', 'جلب خام': 'RawGet',
            'rawset': 'RawSet', 'ضبط خام': 'RawSet',
            'rawequal': 'RawEqual', 'مقارنة خام': 'RawEqual',
            'rawlen': 'RawLen', 'طول خام': 'RawLen',
            'table': 'Table', 'جدول': 'Table',
            'string': 'String', 'نص': 'String',
            'math': 'Math', 'رياضيات': 'Math',
            'os': 'OS', 'نظام': 'OS',
            'io': 'IO', 'إدخال/إخراج': 'IO',
            'debug': 'Debug', 'تصحيح': 'Debug',
            'coroutine': 'Coroutine', 'خيط': 'Coroutine',
            'bit32': 'Bit32', 'بتات': 'Bit32',
            'utf8': 'UTF8', 'يونيكود': 'UTF8',
            'buffer': 'Buffer', 'ذاكرة مؤقتة': 'Buffer',
            'task': 'Task', 'مهمة': 'Task',
            'typeof': 'TypeOf', 'نوع القيمة': 'TypeOf',
            'newproxy': 'NewProxy', 'وكيل جديد': 'NewProxy',
            'debris': 'Debris', 'حذف': 'Debris',
            'collection': 'CollectionService', 'تجميع': 'CollectionService',
            'pathfinding': 'PathfindingService', 'مسار': 'PathfindingService',
            'marketplace': 'MarketplaceService', 'متجر': 'MarketplaceService',
            'teleport': 'TeleportService', 'نقل': 'TeleportService',
            'http': 'HttpService', 'شبكة': 'HttpService',
            'physics': 'PhysicsService', 'فيزياء': 'PhysicsService',
            'context': 'ContextActionService', 'سياق': 'ContextActionService',
            'userinput': 'UserInputService', 'مدخلات': 'UserInputService',
            'run': 'RunService', 'تشغيل': 'RunService',
            'replicated': 'ReplicatedStorage', 'مكرر': 'ReplicatedStorage',
            'server': 'ServerScriptService', 'خادم': 'ServerScriptService',
            'starter': 'StarterGui', 'بداية': 'StarterGui',
            'workspace': 'Workspace', 'مساحة': 'Workspace',
            'lighting': 'Lighting', 'إضاءة': 'Lighting',
            'sound': 'SoundService', 'صوت': 'SoundService',
            'teams': 'Teams', 'فرق': 'Teams',
            'points': 'PointsService', 'نقاط': 'PointsService',
            'social': 'SocialService', 'اجتماعي': 'SocialService',
            'textchat': 'TextChatService', 'محادثة': 'TextChatService',
            'analytics': 'AnalyticsService', 'تحليلات': 'AnalyticsService',
            'insert': 'InsertService', 'إدخال': 'InsertService',
            'test': 'TestService', 'اختبار': 'TestService',
            'group': 'GroupService', 'مجموعة': 'GroupService',
            'badge': 'BadgeService', 'شارة': 'BadgeService',
            'pro': 'ProximityPromptService', 'قريب': 'ProximityPromptService',
        };

        for (const [key, val] of Object.entries(topicMap)) {
            if (lo.includes(key)) {
                topics.push(val);
            }
        }

        return [...new Set(topics)];
    }

    // ═══════════════════════════════════════════
    // حفظ الأنماط
    // ═══════════════════════════════════════════

    learnPatterns(msg, intent) {
        const words = msg.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
            this.data.patterns.push({
                words: words.slice(0, 10),
                intent: intent,
                time: Date.now()
            });

            if (this.data.patterns.length > 200) {
                this.data.patterns = this.data.patterns.slice(-200);
            }
        }
    }

    // ═══════════════════════════════════════════
    // البحث في المعرفة المكتسبة
    // ═══════════════════════════════════════════

    search(query) {
        const lo = query.toLowerCase();
        const results = [];

        // البحث في الأزواج سؤال-جابة
        for (const pair of this.data.qnaPairs) {
            if (pair.q.toLowerCase().includes(lo) || pair.a.toLowerCase().includes(lo)) {
                results.push({
                    type: 'qna',
                    question: pair.q,
                    answer: pair.a,
                    topics: pair.topics,
                    time: pair.time
                });
            }
        }

        // البحث في التصحيحات
        for (const corr of this.data.corrections) {
            if (corr.question.toLowerCase().includes(lo) || corr.correction.toLowerCase().includes(lo)) {
                results.push({
                    type: 'correction',
                    question: corr.question,
                    correction: corr.correction,
                    time: corr.time
                });
            }
        }

        return results.slice(0, 10);
    }

    getSmartAnswer(query) {
        const results = this.search(query);
        if (results.length === 0) return null;

        let answer = '';
        for (const r of results.slice(0, 3)) {
            if (r.type === 'qna' && r.answer) {
                answer += r.answer + '\n\n';
            } else if (r.type === 'correction') {
                answer += '📝 **تصحيح:** ' + r.correction + '\n\n';
            }
        }

        return answer.trim() || null;
    }

    // ═══════════════════════════════════════════
    // حساب مستوى الثقة
    // ═══════════════════════════════════════════

    updateConfidence() {
        const s = this.data.stats;
        let score = 0;
        score += Math.min(s.totalInteractions * 2, 40);
        score += Math.min(s.correctionsMade * 10, 20);
        score += Math.min(s.topicsExplored * 3, 30);
        score += Math.min(s.codeGenerated, 10);
        s.confidence = Math.min(score, 100);

        if (score >= 80) s.playerLevel = 'خبير';
        else if (score >= 50) s.playerLevel = 'متقدم';
        else if (score >= 20) s.playerLevel = 'متوسط';
        else s.playerLevel = 'مبتدئ';
    }

    // ═══════════════════════════════════════════
    // الإحصائيات
    // ═══════════════════════════════════════════

    getStats() {
        this.updateConfidence();
        const topTopics = Object.entries(this.data.topics)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 20);

        return {
            ...this.data.stats,
            topTopics,
            totalQnA: this.data.qnaPairs.length,
            totalCorrections: this.data.corrections.length,
            totalConversations: this.data.conversations.length
        };
    }

    // ═══════════════════════════════════════════
    // تصدير واستيراد
    // ═══════════════════════════════════════════

    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    reset() {
        this.data = this.getDefault();
        this.save();
    }
}
