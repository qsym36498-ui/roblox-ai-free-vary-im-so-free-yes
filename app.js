// ═══════════════════════════════════════
// ROBLOX AI CODER - Main Application
// ═══════════════════════════════════════

let ai;
let learningEngine;
let playerLearning;
let currentPage = 'chat';
let currentLessonFilter = 'basics';
let currentRefFilter = 'luau';

// ═══════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    initLoadingScreen();
});

function initLoadingScreen() {
    const status = document.querySelector('.loading-status');
    const messages = [
        'تهيئة قاعدة المعرفة...',
        'تحميل ملفات Luau...',
        'تهيئة محرك الذكاء...',
        'تحميل أنماط البرمجة...',
        'إعداد المحرر...',
        'جاهز!'
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < messages.length) {
            status.textContent = messages[i];
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loading-screen').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                    document.getElementById('app').classList.remove('hidden');
                    initApp();
                }, 500);
            }, 300);
        }
    }, 500);
}

function initApp() {
    ai = new RobloxAI();
    learningEngine = new SelfLearningEngine();
    playerLearning = new PlayerLearningEngine();
    initNavigation();
    initChat();
    initEditor();
    loadLessons('basics');
    loadReference('luau');
    updateStats();
    startLearningEngine();
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
}

// ═══════════════════════════════════════
// CHAT
// ═══════════════════════════════════════

function initChat() {
    const input = document.getElementById('chatInput');
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    sendMessage();
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    input.value = '';
    input.style.height = 'auto';

    // Detect correction from user
    const lo = msg.toLowerCase();
    const isCorrection = /(غلط|خطأ|الصحيح|ال正确|this is wrong|correct|صحح|اتعلم من|معلومة جديدة|confirm|ي确认)/i.test(lo);
    if (isCorrection && playerLearning && playerLearning.data.conversationHistory.length > 0) {
        const lastQ = playerLearning.data.conversationHistory[playerLearning.data.conversationHistory.length - 1].playerMsg;
        playerLearning.learnFromCorrection(lastQ, msg);
    }

    showTypingIndicator();

    setTimeout(async () => {
        removeTypingIndicator();
        const response = await ai.processMessage(msg);
        addAIMessage(response);

        // Learn from every conversation
        if (playerLearning) {
            playerLearning.learnFromConversation(msg, response, response.meta ? response.meta.intent : 'unknown');
            updateLearningStats();
        }

        // Save to weekly update system
        if (typeof weeklyUpdate !== 'undefined' && weeklyUpdate) {
            weeklyUpdate.saveConversation(msg, response, response.meta ? response.meta.intent : 'unknown');
        }
    }, 800 + Math.random() * 1200);
}

function addMessage(text, type) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.innerHTML = `
        <div class="message-avatar">${type === 'user' ? 'أنت' : 'AI'}</div>
        <div class="message-content"><p>${escapeHtml(text)}</p></div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addAIMessage(response) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'message ai-message';

    let content = `<div class="message-avatar">AI</div><div class="message-content">`;
    content += formatMarkdown(response.text);

    if (response.hasCode && response.code) {
        const escapedCode = escapeHtml(response.code);
        content += `
            <pre><code>${escapedCode}</code></pre>
            <button class="copy-btn" onclick="copyCode(this)">📋 نسخ الكود</button>
        `;
    }

    if (response.source === 'self_learning') {
        content += `<div style="margin-top:8px;font-size:0.75rem;color:#10b981;">🧠 من التعلم الذاتي</div>`;
    }

    if (response.source === 'player_learning') {
        content += `<div style="margin-top:8px;font-size:0.75rem;color:#8b5cf6;">👥 من خبرة اللاعبين</div>`;
    }

    if (response.meta) {
        content += `<div style="margin-top:8px;font-size:0.75rem;color:#64748b;">⏱️ ${response.meta.time}ms | 🎯 ${response.meta.intent}</div>`;
    }

    content += `</div>`;
    div.innerHTML = content;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    if (response.hasCode && response.code) {
        learnFromCode(response.code);
    }
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'message ai-message typing-msg';
    div.innerHTML = `
        <div class="message-avatar">AI</div>
        <div class="message-content">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.querySelector('.typing-msg');
    if (el) el.remove();
}

function copyCode(btn) {
    const code = btn.previousElementSibling.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✅ تم النسخ!';
        setTimeout(() => btn.textContent = '📋 نسخ الكود', 2000);
    });
}

// ═══════════════════════════════════════
// EDITOR
// ═══════════════════════════════════════

function initEditor() {
    const editor = document.getElementById('codeEditor');
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', syncLineNumbers);
    editor.addEventListener('keydown', handleTab);
    updateLineNumbers();
}

function updateLineNumbers() {
    const editor = document.getElementById('codeEditor');
    const lines = editor.value.split('\n').length;
    const lineNumbers = document.getElementById('lineNumbers');
    lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
    document.getElementById('lineCount').textContent = lines;
}

function syncLineNumbers() {
    const editor = document.getElementById('codeEditor');
    const lineNumbers = document.getElementById('lineNumbers');
    lineNumbers.scrollTop = editor.scrollTop;
}

function handleTab(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const editor = e.target;
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        updateLineNumbers();
    }
}

function loadTemplate(type) {
    const templates = {
        'script': '-- Server Script\nlocal Players = game:GetService("Players")\n\n',
        'localScript': '-- LocalScript\nlocal Players = game:GetService("Players")\nlocal player = Players.LocalPlayer\n\n',
        'moduleScript': '-- ModuleScript\nlocal Module = {}\n\nfunction Module.example()\n    return true\nend\n\nreturn Module\n',
        'gui': CODE_GUI,
        'combat': CODE_COMBAT,
        'inventory': CODE_INVENTORY,
        'leaderboard': CODE_LEADERBOARD
    };
    if (templates[type]) {
        document.getElementById('codeEditor').value = templates[type];
        updateLineNumbers();
    }
}

function analyzeCode() {
    const code = document.getElementById('codeEditor').value;
    if (!code.trim()) {
        showOutput('الرجاء كتابة كود أولاً!', 'warning');
        return;
    }

    const issues = [];
    const warnings = [];
    const info = [];

    if (code.includes('wait(') && !code.includes('task.wait(')) {
        warnings.push('⚠️ استخدام wait() بدلاً من task.wait() - الأفضل استخدام task.wait()');
    }
    if (code.includes('game.Workspace') || code.includes('game.Players')) {
        warnings.push('⚠️ استخدام game.X بدلاً من game:GetService("X") - الأفضل استخدام GetService');
    }
    if (!code.includes('pcall') && (code.includes('GetAsync') || code.includes('SetAsync'))) {
        warnings.push('⚠️ عدم استخدام pcall مع DataStore - قد يسبب أخطاء');
    }
    if (code.includes('function') || code.includes('function(')) {
        info.push('✅ تم العثور على دوال');
    }
    if (code.includes('Instance.new')) {
        const instances = code.match(/Instance\.new\("(\w+)"\)/g);
        if (instances) {
            info.push('📦 الكائنات المُنشأة: ' + instances.map(i => i.match(/"(\w+)"/)[1]).join(', '));
        }
    }
    if (code.includes('Connect')) {
        info.push('🔗 تم ربط أحداث');
    }
    if (code.includes('local')) {
        const localCount = (code.match(/\blocal\b/g) || []).length;
        info.push('📝 عدد المتغيرات المحلية: ' + localCount);
    }

    const lines = code.split('\n').length;
    const chars = code.length;
    info.push(`📊 الأسطر: ${lines} | الأحرف: ${chars}`);

    let output = '';
    if (info.length > 0) output += '<div class="output-section"><h4>معلومات</h4>' + info.join('<br>') + '</div>';
    if (warnings.length > 0) output += '<div class="output-section" style="border-color:#f59e0b"><h4 style="color:#f59e0b">تنبيهات</h4>' + warnings.join('<br>') + '</div>';
    if (issues.length > 0) output += '<div class="output-section" style="border-color:#ef4444"><h4 style="color:#ef4444">مشاكل</h4>' + issues.join('<br>') + '</div>';

    if (!output) output = '<div class="output-success">✅ لا توجد مشاكل واضحة في الكود!</div>';
    showOutputRaw(output);
}

function runCode() {
    const code = document.getElementById('codeEditor').value;
    if (!code.trim()) {
        showOutput('الرجاء كتابة كود أولاً!', 'warning');
        return;
    }
    showOutput('ℹ️ ملاحظة: لا يمكن تشغيل كود Roblox مباشرة من المتصفح.\n\nلتشغيل الكود:\n1. افتح Roblox Studio\n2. أنشئ Script/LocalScript\n3. الصق الكود\n4. اضغط Play\n\n✅ الكود جاهز للنسخ واللصق في Studio!', 'info');
}

function aiImproveCode() {
    const code = document.getElementById('codeEditor').value;
    if (!code.trim()) {
        showOutput('الرجاء كتابة كود أولاً!', 'warning');
        return;
    }
    const response = ai.processMessage('حسّن هذا الكود: ' + code.substring(0, 500));
    showOutputRaw(formatMarkdown(response.text));
}

function explainCode() {
    const code = document.getElementById('codeEditor').value;
    if (!code.trim()) {
        showOutput('الرجاء كتابة كود أولاً!', 'warning');
        return;
    }
    const response = ai.processMessage('اشرح هذا الكود: ' + code.substring(0, 500));
    showOutputRaw(formatMarkdown(response.text));
}

function clearOutput() {
    document.getElementById('editorOutput').innerHTML = '<div class="output-placeholder"><svg viewBox="0 0 24 24" width="48" height="48"><path fill="#666" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg><p>الناتج سيظهر هنا</p></div>';
}

function showOutput(text, type) {
    const el = document.getElementById('editorOutput');
    el.innerHTML = `<div class="output-${type || 'info'}" style="white-space:pre-wrap;">${escapeHtml(text)}</div>`;
}

function showOutputRaw(html) {
    document.getElementById('editorOutput').innerHTML = html;
}

// ═══════════════════════════════════════
// GENERATOR
// ═══════════════════════════════════════

function generateCode() {
    const type = document.getElementById('codeType').value;
    const gameType = document.getElementById('gameType').value;
    const desc = document.getElementById('featureDescription').value.trim();

    if (!desc) {
        showNotification('الرجاء كتابة وصف الميزة!', 'warning');
        return;
    }

    const msg = `اكتب كود ${type} لـ ${gameType}: ${desc}`;
    const response = ai.processMessage(msg);

    const el = document.getElementById('generatedCode');
    if (response.hasCode && response.code) {
        el.innerHTML = `<code>${escapeHtml(response.code)}</code>`;
        showNotification('تم توليد الكود بنجاح!', 'success');
    } else {
        el.innerHTML = `<code>${escapeHtml(response.text)}</code>`;
        showNotification('تم توليد الرد!', 'info');
    }
}

function copyGeneratedCode() {
    const code = document.querySelector('#generatedCode code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('تم نسخ الكود!', 'success');
    });
}

function openInEditor() {
    const code = document.querySelector('#generatedCode code').textContent;
    document.getElementById('codeEditor').value = code;
    updateLineNumbers();
    switchPage('editor');
    showNotification('تم نقل الكود للمحرر!', 'success');
}

// ═══════════════════════════════════════
// LESSONS
// ═══════════════════════════════════════

function filterLessons(category) {
    currentLessonFilter = category;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`[onclick*="filterLessons('${category}')"]`).forEach(b => b.classList.add('active'));
    loadLessons(category);
}

function loadLessons(category) {
    const container = document.getElementById('lessonsList');
    const lessons = LESSONS_DATA[category] || LESSONS_DATA.basics;

    container.innerHTML = lessons.map((lesson, i) => `
        <div class="lesson-card" onclick="showLesson('${category}', ${i})">
            <h3>${lesson.title}</h3>
            <p>${lesson.desc}</p>
            <div class="lesson-tags">
                ${lesson.tags.map(t => `<span class="lesson-tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function showLesson(category, index) {
    const lesson = LESSONS_DATA[category][index];
    const container = document.getElementById('lessonsList');
    container.innerHTML = `
        <div class="lesson-detail">
            <button class="btn btn-secondary" onclick="loadLessons('${category}')" style="margin-bottom:20px">← العودة للدروس</button>
            ${lesson.content}
        </div>
    `;
}

// ═══════════════════════════════════════
// TRAINING
// ═══════════════════════════════════════

function switchTrainingTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.training-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll(`[onclick*="switchTrainingTab('${tab}')"]`).forEach(b => b.classList.add('active'));
    document.getElementById(`training-${tab}`).classList.add('active');
}

function addTrainingData() {
    const topic = document.getElementById('trainingTopic').value.trim();
    const data = document.getElementById('trainingData').value.trim();
    const category = document.getElementById('trainingCategory').value;

    if (!topic || !data) {
        showNotification('الرجاء ملء جميع الحقول!', 'warning');
        return;
    }

    ai.addCustomKnowledge(topic, data, category);
    document.getElementById('trainingTopic').value = '';
    document.getElementById('trainingData').value = '';
    updateKnowledgeList();
    updateStats();
    showNotification('تم إضافة المعلومة بنجاح!', 'success');
}

function handleDocUpload(event) {
    const files = event.target.files;
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            ai.addCustomKnowledge(file.name, content, 'uploaded_file');
            addUploadedFile(file.name, content.length);
            updateStats();
        };
        reader.readAsText(file);
    }
    showNotification('تم رفع الملفات بنجاح!', 'success');
}

function addUploadedFile(name, size) {
    const container = document.getElementById('uploadedFiles');
    const div = document.createElement('div');
    div.className = 'uploaded-file';
    div.innerHTML = `<span>📄 ${name}</span><span style="color:#64748b;font-size:0.8rem">${Math.round(size/1024)}KB</span>`;
    container.appendChild(div);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('codeEditor').value = e.target.result;
        updateLineNumbers();
        showNotification('تم تحميل الملف في المحرر!', 'success');
    };
    reader.readAsText(file);
}

function searchAndTrain() {
    const query = document.getElementById('webSearchQuery').value.trim();
    if (!query) {
        showNotification('اكتب شيئاً للبحث!', 'warning');
        return;
    }

    const results = document.getElementById('webResults');
    results.innerHTML = `
        <div class="output-section">
            <h4>نتائج البحث عن: ${escapeHtml(query)}</h4>
            <p style="color:#94a3b8;margin-top:8px;">💡 <strong>نصيحة:</strong> للحصول على أفضل النتائج:</p>
            <ul style="color:#94a3b8;padding-right:20px;margin-top:8px;">
                <li>ابحث في Roblox Developer Hub</li>
                <li>ابحث في Roblox DevForum</li>
                <li>انسخ النص المفيد والصقه في الإدخال اليدوي</li>
            </ul>
            <p style="color:#00b4d8;margin-top:8px;">🔍 ابحث عن: "${escapeHtml(query)}" في <a href="https://create.roblox.com/docs" target="_blank" style="color:#00b4d8">Roblox Docs</a></p>
        </div>
    `;
}

function fetchAndTrain() {
    const url = document.getElementById('webUrl').value.trim();
    if (!url) {
        showNotification('الصق رابطاً!', 'warning');
        return;
    }

    showNotification('💡 للحصول على محتوى الروابط، انسخ النص والصقه في الإدخال اليدوي', 'info');
}

function updateKnowledgeList() {
    const container = document.getElementById('knowledgeList');
    const knowledge = ai.knowledge.training_data || {};
    const entries = Object.entries(knowledge);

    if (entries.length === 0) {
        container.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">لا توجد معرفة مخصصة بعد.<br>أضف معلومات من صفحة التدريب!</div>';
        return;
    }

    container.innerHTML = entries.slice(-20).reverse().map(([topic, data]) => `
        <div class="knowledge-item">
            <div class="ki-topic">${escapeHtml(topic)}</div>
            <div class="ki-preview">${escapeHtml((data.data || '').substring(0, 60))}</div>
            <span class="ki-category">${data.category || 'general'}</span>
        </div>
    `).join('');
}

function searchKnowledge(query) {
    // Filter knowledge list based on search
    const items = document.querySelectorAll('.knowledge-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}

function resetTraining() {
    if (confirm('هل أنت متأكد من إعادة التعلم من الصفر؟')) {
        localStorage.removeItem('roblox_ai_knowledge_v2');
        localStorage.removeItem('roblox_ai_patterns_v2');
        localStorage.removeItem('roblox_self_learning_v1');
        ai = new RobloxAI();
        learningEngine = new SelfLearningEngine();
        updateKnowledgeList();
        updateStats();
        updateLearningDashboard();
        showNotification('تم إعادة التعلم من الصفر!', 'success');
    }
}

// ═══════════════════════════════════════
// REFERENCE
// ═══════════════════════════════════════

function filterReference(category) {
    currentRefFilter = category;
    document.querySelectorAll('.ref-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`[onclick*="filterReference('${category}')"]`).forEach(b => b.classList.add('active'));
    loadReference(category);
}

function loadReference(category) {
    const container = document.getElementById('referenceContent');
    const refs = REFERENCE_DATA[category] || REFERENCE_DATA.luau;

    container.innerHTML = refs.map(ref => `
        <div class="ref-card">
            <h4>${escapeHtml(ref.name)}</h4>
            <p>${escapeHtml(ref.desc)}</p>
            ${ref.code ? `<pre><code>${escapeHtml(ref.code)}</code></pre>` : ''}
        </div>
    `).join('');
}

function searchReference(query) {
    if (!query) {
        loadReference(currentRefFilter);
        return;
    }
    const container = document.getElementById('referenceContent');
    const allRefs = [];
    for (const [cat, refs] of Object.entries(REFERENCE_DATA)) {
        refs.forEach(ref => {
            if (ref.name.toLowerCase().includes(query.toLowerCase()) || ref.desc.toLowerCase().includes(query.toLowerCase())) {
                allRefs.push(ref);
            }
        });
    }
    container.innerHTML = allRefs.map(ref => `
        <div class="ref-card">
            <h4>${escapeHtml(ref.name)}</h4>
            <p>${escapeHtml(ref.desc)}</p>
            ${ref.code ? `<pre><code>${escapeHtml(ref.code)}</code></pre>` : ''}
        </div>
    `).join('');
}

// ═══════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/```lua\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

function showNotification(text, type) {
    const notif = document.getElementById('notification');
    const textEl = document.getElementById('notificationText');
    textEl.textContent = text;
    notif.className = `notification ${type || ''}`;
    notif.classList.remove('hidden');
    setTimeout(() => notif.classList.add('hidden'), 3000);
}

function updateStats() {
    const stats = ai.getStats();
    document.getElementById('knowledgeCounter').textContent = stats.total;
    document.getElementById('totalKnowledge').textContent = stats.total;
    document.getElementById('patternCount').textContent = stats.patterns;
    document.getElementById('knowledgeGained').textContent = stats.total + ' معلومة';

    const level = stats.total < 50 ? 'مبتدئ' : stats.total < 200 ? 'متوسط' : stats.total < 500 ? 'متقدم' : 'خبير';
    document.getElementById('aiLevel').textContent = level;

    const apiCount = Object.keys(KNOWLEDGE_BASE.roblox_api).length;
    const patCount = Object.keys(KNOWLEDGE_BASE.common_patterns).length;
    document.getElementById('apiKnowledge').textContent = apiCount;
    document.getElementById('patternKnowledge').textContent = patCount;

    updateKnowledgeList();
    if (typeof learningEngine !== 'undefined' && learningEngine) {
        updateLearningDashboard();
    }
    if (typeof playerLearning !== 'undefined' && playerLearning) {
        updateLearningStats();
    }
}

function learnFromCode(code) {
    if (!ai.learningEnabled) return;
    ai.patterns.push({
        type: 'code_pattern',
        features: extractCodeFeatures(code),
        time: Date.now()
    });
}

function extractCodeFeatures(code) {
    const features = [];
    if (code.includes('Instance.new')) features.push('instance_creation');
    if (code.includes('Connect')) features.push('event_handling');
    if (code.includes('TweenService')) features.push('tweening');
    if (code.includes('DataStore')) features.push('data_storage');
    if (code.includes('RemoteEvent')) features.push('client_server');
    if (code.includes('Humanoid')) features.push('character');
    if (code.includes('CFrame')) features.push('positioning');
    if (code.includes('Raycast')) features.push('raycasting');
    if (code.includes('pcall')) features.push('error_handling');
    return features;
}

// ═══════════════════════════════════════
// SELF-LEARNING ENGINE
// ═══════════════════════════════════════

function startLearningEngine() {
    learningEngine.onEvent((event, data) => {
        switch(event) {
            case 'started':
                showLearningStatus('تم بدء خادم التعلم! 🧠', 'success');
                break;
            case 'learning':
                updateLearningProgress(data);
                break;
            case 'learned':
                onKnowledgeLearned(data);
                break;
            case 'cycle_complete':
                showLearningComplete(data);
                break;
            case 'error':
                showLearningStatus('خطأ في التعلم: ' + data.error, 'warning');
                break;
            case 'stopped':
                showLearningStatus('تم إيقاف خادم التعلم', 'info');
                break;
        }
    });

    learningEngine.start();
    updateLearningDashboard();
}

function onKnowledgeLearned(data) {
    const text = learningEngine.getSmartResponse(data.topic);
    if (text && ai) {
        ai.addCustomKnowledge('self_learned_' + data.topic, text, 'auto_learned');
    }
    updateLearningDashboard();
    updateStats();
}

function updateLearningProgress(data) {
    const el = document.getElementById('learningProgress');
    if (el) {
        el.innerHTML = `
            <div class="learning-item">
                <span class="learning-icon">🔍</span>
                <span>يتعلم: <strong>${data.topic}</strong></span>
                <span class="learning-remaining">متبقي: ${data.remaining}</span>
            </div>
        `;
    }
}

function showLearningStatus(text, type) {
    const el = document.getElementById('learningStatus');
    if (el) {
        el.innerHTML = `<div class="learning-status-${type}">${text}</div>`;
    }
}

function showLearningComplete(data) {
    showLearningStatus(`تم التعلم! ${data.total} معلومة من ${data.sources} مصدر`, 'success');
    updateLearningDashboard();
}

function updateLearningDashboard() {
    const stats = learningEngine.getStats();

    const progressEl = document.getElementById('learningProgress');
    const statsEl = document.getElementById('learningStats');
    const topicsEl = document.getElementById('learningTopics');

    if (progressEl) {
        const confidence = stats.confidence || 0;
        progressEl.innerHTML = `
            <div class="learning-progress-bar">
                <div class="progress-fill" style="width: ${confidence}%"></div>
                <span class="progress-text">${confidence}% ثقة</span>
            </div>
            <div class="learning-progress-stats">
                <span>📚 ${stats.totalLearned} معلومة</span>
                <span>📖 ${stats.sourcesScanned} مصدر</span>
                <span>🔄 ${stats.queueSize} متبقي</span>
            </div>
        `;
    }

    if (statsEl) {
        statsEl.innerHTML = `
            <div class="learning-stat-card">
                <div class="stat-number">${stats.totalLearned}</div>
                <div class="stat-label">معلومات مكتسبة</div>
            </div>
            <div class="learning-stat-card">
                <div class="stat-number">${stats.sourcesScanned}</div>
                <div class="stat-label">مصدر تم مسحه</div>
            </div>
            <div class="learning-stat-card">
                <div class="stat-number">${stats.totalTopics}</div>
                <div class="stat-label">موضوع مغطى</div>
            </div>
            <div class="learning-stat-card">
                <div class="stat-number">${confidence}%</div>
                <div class="stat-label">نسبة الثقة</div>
            </div>
        `;
    }

    if (topicsEl) {
        const cats = stats.categories || {};
        topicsEl.innerHTML = Object.entries(cats).map(([cat, count]) => `
            <div class="topic-item">
                <span class="topic-name">${cat}</span>
                <span class="topic-count">${count}</span>
            </div>
        `).join('');
    }
}

function toggleLearningEngine() {
    if (learningEngine.isRunning) {
        learningEngine.stop();
    } else {
        learningEngine.start();
    }
}

function exportLearningData() {
    const data = learningEngine.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roblox_ai_learning_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('تم تصدير البيانات!', 'success');
}

function resetLearningData() {
    if (confirm('هل أنت متأكد من حذف كل البيانات المكتسبة؟')) {
        localStorage.removeItem('roblox_self_learning_v1');
        localStorage.removeItem('roblox_player_learning_v2');
        localStorage.removeItem('roblox_weekly_data_v1');
        learningEngine = new SelfLearningEngine();
        playerLearning = new PlayerLearningEngine();
        if (typeof weeklyUpdate !== 'undefined' && weeklyUpdate) {
            weeklyUpdate.clearData();
        }
        updateLearningDashboard();
        updateStats();
        showNotification('تم حذف البيانات المكتسبة!', 'success');
    }
}

// ═══════════════════════════════════════════
// WEEKLY UPDATE FUNCTIONS
// ═══════════════════════════════════════════

function exportWeeklyData() {
    if (typeof weeklyUpdate === 'undefined' || !weeklyUpdate) {
        showNotification('نظام التحديث الأسبوعي غير متاح!', 'error');
        return;
    }
    weeklyUpdate.exportConversations();
    showNotification('تم تصدير المحادثات! 📥', 'success');
}

function importWeeklyData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await weeklyUpdate.importConversations(file);
            showNotification(`تم استيراد ${result.added} محادثة جديدة! 📤`, 'success');
            updateWeeklyStats();
        } catch (err) {
            showNotification('خطأ في الاستيراد: ' + err.message, 'error');
        }
    };
    input.click();
}

function generateWeeklyUpdate() {
    if (typeof weeklyUpdate === 'undefined' || !weeklyUpdate) {
        showNotification('نظام التحديث الأسبوعي غير متاح!', 'error');
        return;
    }
    const updateFile = weeklyUpdate.generateUpdateFile();
    const blob = new Blob([JSON.stringify(updateFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-update-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('تم إنشاء ملف التحديث! 📄', 'success');
}

function applyWeeklyUpdate() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const updateData = JSON.parse(ev.target.result);
                const result = weeklyUpdate.applyUpdate(updateData);
                if (result.success) {
                    showNotification(`تم التطبيق! أضفنا ${result.topicsAdded} موضوع جديد 🎉`, 'success');
                    ai.rebuildIndex();
                    updateStats();
                } else {
                    showNotification('خطأ: ' + result.error, 'error');
                }
            };
            reader.readAsText(file);
        } catch (err) {
            showNotification('خطأ: ' + err.message, 'error');
        }
    };
    input.click();
}

function updateWeeklyStats() {
    if (typeof weeklyUpdate === 'undefined' || !weeklyUpdate) return;
    const stats = weeklyUpdate.getStats();
    const el = document.getElementById('weeklyStats');
    if (el) {
        el.innerHTML = `
            <div class="player-stat">
                <span class="player-stat-num">${stats.totalConversations}</span>
                <span class="player-stat-label">محادثة</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.uniqueQuestions}</span>
                <span class="player-stat-label">سؤال فريد</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.uniqueDevices}</span>
                <span class="player-stat-label">جهاز</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.exportedAt}</span>
                <span class="player-stat-label">آخر تصدير</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.lastUpdate}</span>
                <span class="player-stat-label">آخر تحديث</span>
            </div>
        `;
    }
}

// ═══════════════════════════════════════
// PLAYER LEARNING STATS
// ═══════════════════════════════════════

function updateLearningStats() {
    if (!playerLearning) return;
    const stats = playerLearning.getStats();

    const el = document.getElementById('playerLearningStats');
    if (el) {
        el.innerHTML = `
            <div class="player-stat">
                <span class="player-stat-num">${stats.totalInteractions}</span>
                <span class="player-stat-label">تفاعل</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.questionsAsked}</span>
                <span class="player-stat-label">سؤال</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.correctionsMade}</span>
                <span class="player-stat-label">تصحيح</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.topicsExplored}</span>
                <span class="player-stat-label">موضوع</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.confidence}%</span>
                <span class="player-stat-label">ثقة</span>
            </div>
            <div class="player-stat">
                <span class="player-stat-num">${stats.playerLevel}</span>
                <span class="player-stat-label">مستوى</span>
            </div>
        `;
    }

    const topicsEl = document.getElementById('playerTopics');
    if (topicsEl && stats.topTopics.length > 0) {
        topicsEl.innerHTML = stats.topTopics.map(([topic, data]) => `
            <div class="topic-badge">
                <span>${topic}</span>
                <span class="topic-count">${data.count}</span>
            </div>
        `).join('');
    }
}
