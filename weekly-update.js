// ═══════════════════════════════════════════════════════════════
// WEEKLY UPDATE SYSTEM - نظام التحديث الأسبوعي
// ═══════════════════════════════════════════════════════════════

class WeeklyUpdateSystem {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        try {
            const saved = localStorage.getItem('roblox_weekly_data_v1');
            return saved ? JSON.parse(saved) : {
                conversations: [],
                exportedAt: null,
                lastUpdate: null
            };
        } catch (e) {
            return { conversations: [], exportedAt: null, lastUpdate: null };
        }
    }

    saveData() {
        try {
            localStorage.setItem('roblox_weekly_data_v1', JSON.stringify(this.data));
        } catch (e) {}
    }

    // ═══════════════════════════════════════════
    // حفظ المحادثة
    // ═══════════════════════════════════════════

    saveConversation(userMsg, aiResponse, intent) {
        this.data.conversations.push({
            q: userMsg,
            a: aiResponse.text || aiResponse,
            intent: intent,
            time: Date.now(),
            deviceId: this.getDeviceId()
        });
        this.saveData();
    }

    getDeviceId() {
        let id = localStorage.getItem('device_id');
        if (!id) {
            id = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', id);
        }
        return id;
    }

    // ═══════════════════════════════════════════
    // تصدير المحادثات
    // ═══════════════════════════════════════════

    exportConversations() {
        const data = {
            deviceId: this.getDeviceId(),
            exportTime: new Date().toISOString(),
            conversations: this.data.conversations,
            stats: this.getStats()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roblox-ai-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.data.exportedAt = Date.now();
        this.saveData();

        return data;
    }

    // ═══════════════════════════════════════════
    // استيراد المحادثات
    // ═══════════════════════════════════════════

    importConversations(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (imported.conversations && Array.isArray(imported.conversations)) {
                        // إضافة المحادثات الجديدة
                        const existing = new Set(this.data.conversations.map(c => c.q + c.a));
                        let added = 0;
                        for (const conv of imported.conversations) {
                            const key = conv.q + conv.a;
                            if (!existing.has(key)) {
                                this.data.conversations.push(conv);
                                existing.add(key);
                                added++;
                            }
                        }
                        this.saveData();
                        resolve({ added, total: this.data.conversations.length });
                    } else {
                        reject(new Error('Invalid file format'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    }

    // ═══════════════════════════════════════════
    // تحليل المحادثات واستخراج المعرفة
    // ═══════════════════════════════════════════

    analyzeConversations() {
        const knowledge = {
            topics: {},
            questions: [],
            patterns: [],
            corrections: []
        };

        for (const conv of this.data.conversations) {
            // استخراج المواضيع
            const topic = this.extractTopic(conv.q);
            if (topic) {
                knowledge.topics[topic] = (knowledge.topics[topic] || 0) + 1;
            }

            // حفظ الأسئلة والإجابات
            knowledge.questions.push({
                q: conv.q,
                a: conv.a,
                intent: conv.intent
            });

            // كشف التصحيحات
            if (/(غلط|خطأ|الصحيح|correct|صحح)/i.test(conv.q)) {
                knowledge.corrections.push({
                    original: conv.q,
                    correction: conv.a
                });
            }
        }

        return knowledge;
    }

    extractTopic(msg) {
        const lo = msg.toLowerCase();
        const topics = {
            'Part': /part|جسيم|جزمه/i,
            'TweenService': /tween|tweenservice|حركة|تحريك/i,
            'DataStoreService': /datastore|data store|حفظ|بيانات/i,
            'RemoteEvent': /remote|ريموت|تحديث/i,
            'Players': /players|لاعب|لاعبين/i,
            'GUI': /gui|واجهة|واجه/i,
            'Script': /script|سكربت|كود/i,
            'CFrame': /cframe|موقع|دوران/i,
            'Vector3': /vector3|متجه|🐨ordinates/i,
            'Instance': /instance|كائن|إنشاء/i
        };

        for (const [topic, regex] of Object.entries(topics)) {
            if (regex.test(lo)) return topic;
        }
        return null;
    }

    // ═══════════════════════════════════════════
    // إنشاء ملف التحديث
    // ═══════════════════════════════════════════

    generateUpdateFile() {
        const knowledge = this.analyzeConversations();

        const updateFile = {
            version: '1.0.0',
            date: new Date().toISOString(),
            stats: this.getStats(),
            knowledge: knowledge,
            topTopics: Object.entries(knowledge.topics)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            newPatterns: knowledge.patterns,
            corrections: knowledge.corrections
        };

        return updateFile;
    }

    // ═══════════════════════════════════════════
    // تطبيق التحديث على knowledge-base.js
    // ═══════════════════════════════════════════

    applyUpdate(updateData) {
        try {
            // إضافة المعرفة الجديدة إلى training_data
            const current = JSON.parse(localStorage.getItem('roblox_ai_knowledge_v3') || '{}');
            if (!current.training_data) current.training_data = {};

            for (const [topic, count] of Object.entries(updateData.knowledge.topics || {})) {
                if (!current.training_data[topic]) {
                    current.training_data[topic] = {
                        count: count,
                        learnedFrom: 'player_updates',
                        time: Date.now()
                    };
                }
            }

            localStorage.setItem('roblox_ai_knowledge_v3', JSON.stringify(current));
            this.data.lastUpdate = Date.now();
            this.saveData();

            return { success: true, topicsAdded: Object.keys(updateData.knowledge.topics || {}).length };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // ═══════════════════════════════════════════
    // الإحصائيات
    // ═══════════════════════════════════════════

    getStats() {
        const conversations = this.data.conversations;
        const uniqueQuestions = new Set(conversations.map(c => c.q)).size;
        const uniqueDevices = new Set(conversations.map(c => c.deviceId)).size;

        return {
            totalConversations: conversations.length,
            uniqueQuestions,
            uniqueDevices,
            exportedAt: this.data.exportedAt ? new Date(this.data.exportedAt).toLocaleString() : 'لم يتم التصدير بعد',
            lastUpdate: this.data.lastUpdate ? new Date(this.data.lastUpdate).toLocaleString() : 'لم يتم التحديث بعد'
        };
    }

    // ═══════════════════════════════════════════
    // مسح البيانات
    // ═══════════════════════════════════════════

    clearData() {
        this.data = { conversations: [], exportedAt: null, lastUpdate: null };
        this.saveData();
    }
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════

let weeklyUpdate;
try {
    weeklyUpdate = new WeeklyUpdateSystem();
} catch (e) {
    console.error('WeeklyUpdateSystem init error:', e);
}
