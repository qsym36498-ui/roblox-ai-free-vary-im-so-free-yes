// ═══════════════════════════════════════════════════════════════
// WEEKLY UPDATE SYSTEM - نظام التحديث الأسبوعي
// ═══════════════════════════════════════════════════════════════

class WeeklyUpdateSystem {
    constructor() {
        this.data = this.loadData();
        this.autoExportInterval = null;
        this.checkAndForceExport();
    }

    loadData() {
        try {
            const saved = localStorage.getItem('roblox_weekly_data_v1');
            return saved ? JSON.parse(saved) : {
                conversations: [],
                exportedAt: null,
                lastUpdate: null,
                forceExportShown: false
            };
        } catch (e) {
            return { conversations: [], exportedAt: null, lastUpdate: null, forceExportShown: false };
        }
    }

    saveData() {
        try {
            localStorage.setItem('roblox_weekly_data_v1', JSON.stringify(this.data));
        } catch (e) {}
    }

    // ═══════════════════════════════════════════
    // فحص وإجبار التصدير
    // ═══════════════════════════════════════════

    checkAndForceExport() {
        // إذا ما صدر من 7 أيام أو أكثر
        const lastExport = this.data.exportedAt;
        const daysSinceExport = lastExport ? (Date.now() - lastExport) / (1000 * 60 * 60 * 24) : 999;

        if (daysSinceExport >= 7 && this.data.conversations.length > 0) {
            this.showForceExportModal();
        }
    }

    showForceExportModal() {
        if (this.data.forceExportShown) return;
        this.data.forceExportShown = true;
        this.saveData();

        // إنشاء نافذة إجبارية
        const modal = document.createElement('div');
        modal.id = 'forceExportModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI', sans-serif;
        `;
        modal.innerHTML = `
            <div style="background: #1a1a2e; border: 2px solid #ff6b35; border-radius: 20px; padding: 40px; max-width: 500px; text-align: center;">
                <h2 style="color: #ff6b35; margin-bottom: 20px;">⚠️ رفع المحادثات مطلوب</h2>
                <p style="color: #e0e0e0; margin-bottom: 20px; line-height: 1.8;">
                    لاستمرار استخدام التطبيق، يجب رفع محادثاتك لتحسين الذكاء الاصطناعي.
                    <br><br>
                    هذا الشرط الأساسي لاستخدام التطبيق.
                </p>
                <p style="color: #888; margin-bottom: 20px; font-size: 0.9rem;">
                    محادثاتك: ${this.data.conversations.length} محادثة
                </p>
                <button onclick="weeklyUpdate.forceExport()" style="
                    background: #ff6b35; color: white; border: none; padding: 15px 40px;
                    border-radius: 10px; font-size: 1.1rem; cursor: pointer; margin: 5px;
                ">📤 رفع المحادثات الآن</button>
                <br>
                <p style="color: #666; margin-top: 15px; font-size: 0.8rem;">
                    سيتم حفظ المحادثات محلياً ويمكنك مشاركتها مع المطور
                </p>
            </div>
        `;
        document.body.appendChild(modal);
    }

    forceExport() {
        const data = this.exportConversations();
        this.data.forceExportShown = false;
        this.data.exportedAt = Date.now();
        this.saveData();

        // إزالة النافذة
        const modal = document.getElementById('forceExportModal');
        if (modal) modal.remove();

        // عرض رسالة نجاح
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: #10b981;
            color: white; padding: 20px 30px; border-radius: 10px; z-index: 99999;
            font-family: 'Segoe UI', sans-serif; animation: slideIn 0.3s ease;
        `;
        msg.innerHTML = `
            <strong>✅ تم رفع المحادثات بنجاح!</strong>
            <br>
            <small>يمكنك استخدام التطبيق بشكل طبيعي</small>
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }

    // ═══════════════════════════════════════════
    // حفظ المحادثة تلقائياً
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

        // فحص كل 10 محادثات
        if (this.data.conversations.length % 10 === 0) {
            this.checkAndForceExport();
        }
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
            const topic = this.extractTopic(conv.q);
            if (topic) {
                knowledge.topics[topic] = (knowledge.topics[topic] || 0) + 1;
            }

            knowledge.questions.push({
                q: conv.q,
                a: conv.a,
                intent: conv.intent
            });

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
            'Vector3': /vector3|متجه|coordinates/i,
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
        this.data = { conversations: [], exportedAt: null, lastUpdate: null, forceExportShown: false };
        this.saveData();
    }
}

let weeklyUpdate;
try {
    weeklyUpdate = new WeeklyUpdateSystem();
} catch (e) {
    console.error('WeeklyUpdateSystem init error:', e);
}
