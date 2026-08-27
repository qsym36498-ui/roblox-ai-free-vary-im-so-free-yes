// ═══════════════════════════════════════════════════════════════
// AUTO UPDATE SERVER - سيرفر التحديث التلقائي
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ═══════════════════════════════════════════
// قاعدة البيانات
// ═══════════════════════════════════════════

const DB_FILE = path.join(__dirname, 'conversations_db.json');
const KNOWLEDGE_FILE = path.join(__dirname, 'auto_knowledge.json');

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
    return { conversations: [], devices: {}, lastUpdate: null };
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function loadKnowledge() {
    if (fs.existsSync(KNOWLEDGE_FILE)) {
        return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8'));
    }
    return { topics: {}, patterns: [], lastAnalysis: null };
}

function saveKnowledge(data) {
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// API: استقبال المحادثات
// ═══════════════════════════════════════════

app.post('/api/conversations', (req, res) => {
    const { deviceId, conversations } = req.body;

    if (!deviceId || !conversations || !Array.isArray(conversations)) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const db = loadDB();

    // حفظ المحادثات
    let added = 0;
    for (const conv of conversations) {
        const key = conv.q + conv.a + conv.time;
        if (!db.conversations.find(c => (c.q + c.a + c.time) === key)) {
            db.conversations.push({
                ...conv,
                deviceId,
                receivedAt: Date.now()
            });
            added++;
        }
    }

    // تحديث إحصائيات الجهاز
    db.devices[deviceId] = {
        lastSeen: Date.now(),
        totalConversations: (db.devices[deviceId]?.totalConversations || 0) + added
    };

    saveDB(db);

    // تحليل تلقائي كل 100 محادثة جديدة
    if (db.conversations.length % 100 < added) {
        analyzeAndUpdate();
    }

    res.json({
        success: true,
        added,
        total: db.conversations.length,
        devices: Object.keys(db.devices).length
    });
});

// ═══════════════════════════════════════════
// API: جلب المعرفة المحدثة
// ═══════════════════════════════════════════

app.get('/api/knowledge', (req, res) => {
    const knowledge = loadKnowledge();
    res.json(knowledge);
});

// ═══════════════════════════════════════════
// API: إحصائيات
// ═══════════════════════════════════════════

app.get('/api/stats', (req, res) => {
    const db = loadDB();
    const knowledge = loadKnowledge();

    res.json({
        totalConversations: db.conversations.length,
        totalDevices: Object.keys(db.devices).length,
        topicsLearned: Object.keys(knowledge.topics).length,
        lastUpdate: knowledge.lastAnalysis,
        topTopics: Object.entries(knowledge.topics)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([topic, count]) => ({ topic, count }))
    });
});

// ═══════════════════════════════════════════
// API: تحليل يدوي
// ═══════════════════════════════════════════

app.post('/api/analyze', (req, res) => {
    const result = analyzeAndUpdate();
    res.json(result);
});

// ═══════════════════════════════════════════
// التحليل والاستخراج التلقائي
// ═══════════════════════════════════════════

function analyzeAndUpdate() {
    const db = loadDB();
    const knowledge = loadKnowledge();

    // تحليل كل المحادثات
    for (const conv of db.conversations) {
        // استخراج المواضيع
        const topic = extractTopic(conv.q);
        if (topic) {
            knowledge.topics[topic] = (knowledge.topics[topic] || 0) + 1;
        }

        // استخراج الأنماط
        const pattern = extractPattern(conv.q, conv.a);
        if (pattern && !knowledge.patterns.find(p => p.q === pattern.q)) {
            knowledge.patterns.push(pattern);
        }
    }

    knowledge.lastAnalysis = new Date().toISOString();
    saveKnowledge(knowledge);

    return {
        success: true,
        topicsFound: Object.keys(knowledge.topics).length,
        patternsFound: knowledge.patterns.length,
        analyzed: db.conversations.length
    };
}

function extractTopic(msg) {
    const lo = msg.toLowerCase();
    const topics = {
        'Part': /part|جسيم|جزمه|ball|block|cylinder|wedge/i,
        'TweenService': /tween|tweenservice|حركة|تحريك|animation/i,
        'DataStoreService': /datastore|data store|حفظ|بيانات|save|load/i,
        'RemoteEvent': /remote|remoteevent|remote function|ريموت|تحديث/i,
        'Players': /players|player|لاعب|لاعبين|character/i,
        'GUI': /gui|screen gui|frame|button|label|واجهة|واجه/i,
        'Script': /script|local script|module script|سكربت|كود/i,
        'CFrame': /cframe|position|rotation|موقع|دوران/i,
        'Vector3': /vector3|vector|متجه|coordinates|position/i,
        'Instance': /instance|new|create|كائن|إنشاء/i,
        'Workspace': /workspace|game\.workspace|العالم/i,
        'ReplicatedStorage': /replicatedstorage|replicated|تخزين/i,
        'ServerScriptService': /serverscriptservice|server script/i,
        'StarterGui': /startergui|gui service/i,
        'Lighting': /lighting|light|ambient|sky|env/i,
        'RunService': /runservice|heartbeat|renderstepped|update/i,
        'UserInputService': /userinputservice|input|keyboard|mouse/i,
        'Physics': /physics|bodyforce|bodyvelocity|bodyposition|constraint/i,
        'Touch': /touched|touch|لمس|ollision/i,
        'Click': /click|mousebutton|نقر/i,
        'Tool': /tool|أداة|adget/i,
        'Sound': /sound|صوت|music/i,
        'Animation': /animation|rick|humanoid/i,
        'Leaderstats': /leaderstats|leaderboard|score|points/i,
        'Shop': /shop|store|متجر|شراء|buy/i,
        'Combat': /combat|kill|health|damage|قتال|هجوم/i,
        'Teleport': /teleport|tp|نقل|انتقال/i,
        'Vehicle': /vehicle|car|seat|مركبة|سيارة/i,
        'NPC': /npc|enemy|zombie|hostile/i,
        'Inventory': /inventory|bag|حقيبة|items/i,
        'Quest': /quest|mission|مهمة|هدف/i,
        'Minigame': /minigame|game mode|لعبة|جولة/i,
        'Chat': /chat|message|رسالة|محادثة/i
    };

    for (const [topic, regex] of Object.entries(topics)) {
        if (regex.test(lo)) return topic;
    }
    return null;
}

function extractPattern(q, a) {
    if (!a || !a.text) return null;

    // كشف الأكواد
    const codeMatch = a.text.match(/```lua\n([\s\S]*?)```/);
    if (codeMatch) {
        return {
            q: q.substring(0, 100),
            code: codeMatch[1],
            time: Date.now()
        };
    }

    return null;
}

// ═══════════════════════════════════════════
// تشغيل السيرفر
// ═══════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`\n🎮 Auto Update Server شغال على:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   POST /api/conversations  - استقبال المحادثات`);
    console.log(`   GET  /api/knowledge      - جلب المعرفة`);
    console.log(`   GET  /api/stats          - الإحصائيات`);
    console.log(`   POST /api/analyze        - تحليل يدوي`);
    console.log(`\n🌐 افتح المتصفح على: http://localhost:${PORT}\n`);
});
