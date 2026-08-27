// ═══════════════════════════════════════════════════════════════
// SELF-LEARNING ENGINE - خادم التعليم الذاتي المستمر
// ═══════════════════════════════════════════════════════════════

class SelfLearningEngine {
    constructor() {
        this.isRunning = false;
        this.learnedData = this.loadLearned();
        this.searchQueue = [];
        this.processedSources = new Set(this.learnedData.processed || []);
        this.knowledgeIndex = this.learnedData.index || {};
        this.stats = this.learnedData.stats || {
            totalLearned: 0,
            sourcesScanned: 0,
            lastRun: null,
            topicsCovered: {},
            confidence: {}
        };
        this.listeners = [];
        this.docsQueue = [];
    }

    loadLearned() {
        try {
            const s = localStorage.getItem('roblox_self_learning_v1');
            return s ? JSON.parse(s) : { processed: [], index: {}, stats: {}, entries: {} };
        } catch (e) {
            return { processed: [], index: {}, stats: {}, entries: {} };
        }
    }

    saveLearned() {
        try {
            this.learnedData.processed = [...this.processedSources];
            this.learnedData.index = this.knowledgeIndex;
            this.learnedData.stats = this.stats;
            localStorage.setItem('roblox_self_learning_v1', JSON.stringify(this.learnedData));
        } catch (e) {}
    }

    onEvent(callback) { this.listeners.push(callback); }
    emit(event, data) { this.listeners.forEach(l => l(event, data)); }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.emit('started', {});
        this.buildSearchQueue();
        this.runLearningCycle();
    }

    stop() {
        this.isRunning = false;
        this.emit('stopped', {});
    }

    buildSearchQueue() {
        this.docsQueue = [
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Instance.md', topic: 'Instance', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Part.md', topic: 'Part', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Model.md', topic: 'Model', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Script.md', topic: 'Script', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/LocalScript.md', topic: 'LocalScript', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ModuleScript.md', topic: 'ModuleScript', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Humanoid.md', topic: 'Humanoid', category: 'character' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Player.md', topic: 'Player', category: 'player' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Camera.md', topic: 'Camera', category: 'rendering' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TweenService.md', topic: 'TweenService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/DataStoreService.md', topic: 'DataStoreService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Players.md', topic: 'Players', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ReplicatedStorage.md', topic: 'ReplicatedStorage', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/RunService.md', topic: 'RunService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/UserInputService.md', topic: 'UserInputService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Lighting.md', topic: 'Lighting', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/PathfindingService.md', topic: 'PathfindingService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/CollectionService.md', topic: 'CollectionService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/MarketplaceService.md', topic: 'MarketplaceService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/RemoteEvent.md', topic: 'RemoteEvent', category: 'networking' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/RemoteFunction.md', topic: 'RemoteFunction', category: 'networking' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ScreenGui.md', topic: 'ScreenGui', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Frame.md', topic: 'Frame', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TextLabel.md', topic: 'TextLabel', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TextButton.md', topic: 'TextButton', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TextBox.md', topic: 'TextBox', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ScrollingFrame.md', topic: 'ScrollingFrame', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ImageButton.md', topic: 'ImageButton', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ImageLabel.md', topic: 'ImageLabel', category: 'gui' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Sound.md', topic: 'Sound', category: 'audio' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ParticleEmitter.md', topic: 'ParticleEmitter', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Beam.md', topic: 'Beam', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Trail.md', topic: 'Trail', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ProximityPrompt.md', topic: 'ProximityPrompt', category: 'interaction' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ClickDetector.md', topic: 'ClickDetector', category: 'interaction' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Tool.md', topic: 'Tool', category: 'gameplay' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Explosion.md', topic: 'Explosion', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/WeldConstraint.md', topic: 'WeldConstraint', category: 'physics' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/VectorForce.md', topic: 'VectorForce', category: 'physics' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/LinearVelocity.md', topic: 'LinearVelocity', category: 'physics' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/AlignOrientation.md', topic: 'AlignOrientation', category: 'physics' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/BallSocketConstraint.md', topic: 'BallSocketConstraint', category: 'physics' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/HingeConstraint.md', topic: 'HingeConstraint', category: 'physics' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Debris.md', topic: 'Debris', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/SpawnLocation.md', topic: 'SpawnLocation', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Terrain.md', topic: 'Terrain', category: 'world' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Workspace.md', topic: 'Workspace', category: 'core' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Decal.md', topic: 'Decal', category: 'rendering' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/MeshPart.md', topic: 'MeshPart', category: 'rendering' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/PointLight.md', topic: 'PointLight', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/SpotLight.md', topic: 'SpotLight', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Fire.md', topic: 'Fire', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Smoke.md', topic: 'Smoke', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Sparkles.md', topic: 'Sparkles', category: 'effects' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/BodyVelocity.md', topic: 'BodyVelocity', category: 'physics_legacy' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/BodyGyro.md', topic: 'BodyGyro', category: 'physics_legacy' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/BodyForce.md', topic: 'BodyForce', category: 'physics_legacy' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ContextActionService.md', topic: 'ContextActionService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TeleportService.md', topic: 'TeleportService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/HttpService.md', topic: 'HttpService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/BadgeService.md', topic: 'BadgeService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/GroupService.md', topic: 'GroupService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/Teams.md', topic: 'Teams', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/SoundService.md', topic: 'SoundService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/PhysicsService.md', topic: 'PhysicsService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/StarterGui.md', topic: 'StarterGui', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/StarterPack.md', topic: 'StarterPack', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/StarterPlayer.md', topic: 'StarterPlayer', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ServerScriptService.md', topic: 'ServerScriptService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ServerStorage.md', topic: 'ServerStorage', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TextChatService.md', topic: 'TextChatService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ProximityPromptService.md', topic: 'ProximityPromptService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/SocialService.md', topic: 'SocialService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/AnalyticsService.md', topic: 'AnalyticsService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/InsertService.md', topic: 'InsertService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/TestService.md', topic: 'TestService', category: 'service' },
            { url: 'https://create.roblox.com/docs/reference/engine/classes/ReplicatedFirst.md', topic: 'ReplicatedFirst', category: 'service' },
        ];

        this.searchQueue = this.docsQueue.filter(d => !this.processedSources.has(d.topic));
    }

    async runLearningCycle() {
        while (this.isRunning && this.searchQueue.length > 0) {
            const item = this.searchQueue.shift();
            try {
                this.emit('learning', { topic: item.topic, category: item.category, remaining: this.searchQueue.length });
                await this.learnFromDocs(item);
                await this.delay(2000 + Math.random() * 3000);
            } catch (e) {
                this.emit('error', { topic: item.topic, error: e.message });
                await this.delay(5000);
            }
        }

        if (this.isRunning) {
            this.emit('cycle_complete', { total: this.stats.totalLearned, sources: this.stats.sourcesScanned });
            await this.delay(60000);
            this.searchQueue = this.docsQueue.filter(d => !this.processedSources.has(d.topic));
            if (this.isRunning) this.runLearningCycle();
        }
    }

    async learnFromDocs(item) {
        const resp = await fetch(item.url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();

        const knowledge = this.extractKnowledge(text, item.topic);

        if (knowledge.length > 0) {
            this.knowledgeIndex[item.topic] = {
                category: item.category,
                entries: knowledge,
                timestamp: Date.now(),
                source: item.url
            };
            this.stats.totalLearned += knowledge.length;
        }

        this.processedSources.add(item.topic);
        this.stats.sourcesScanned++;
        this.stats.topicsCovered[item.category] = (this.stats.topicsCovered[item.category] || 0) + 1;
        this.stats.lastRun = Date.now();
        this.saveLearned();

        this.emit('learned', {
            topic: item.topic,
            entries: knowledge.length,
            total: this.stats.totalLearned
        });
    }

    extractKnowledge(text, topic) {
        const knowledge = [];
        const lines = text.split('\n');
        let currentSection = '';
        let buffer = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('#')) {
                if (buffer.length > 0 && currentSection) {
                    const content = buffer.join('\n').trim();
                    if (content.length > 10) {
                        knowledge.push({
                            section: currentSection,
                            content: content,
                            topic: topic,
                            timestamp: Date.now()
                        });
                    }
                    buffer = [];
                }
                currentSection = trimmed.replace(/^#+\s*/, '');
            } else if (trimmed.length > 0) {
                buffer.push(trimmed);
            }
        }

        if (buffer.length > 0 && currentSection) {
            const content = buffer.join('\n').trim();
            if (content.length > 10) {
                knowledge.push({
                    section: currentSection,
                    content: content,
                    topic: topic,
                    timestamp: Date.now()
                });
            }
        }

        return knowledge;
    }

    searchKnowledge(query) {
        const results = [];
        const q = query.toLowerCase();

        for (const [topic, data] of Object.entries(this.knowledgeIndex)) {
            if (topic.toLowerCase().includes(q)) {
                results.push({ topic, ...data });
            }
            for (const entry of data.entries) {
                if (entry.content.toLowerCase().includes(q) || entry.section.toLowerCase().includes(q)) {
                    results.push({ topic, section: entry.section, content: entry.content, category: data.category });
                }
            }
        }

        return results;
    }

    getSmartResponse(query) {
        const results = this.searchKnowledge(query);
        if (results.length === 0) return null;

        let response = `📚 **نتائج من التعلم الذاتي** (${results.length} نتيجة)\n\n`;
        for (const r of results.slice(0, 3)) {
            response += `### ${r.topic}`;
            if (r.section) response += ` > ${r.section}`;
            response += `\n${r.content.substring(0, 500)}\n\n`;
        }

        return response;
    }

    getStats() {
        const categories = {};
        for (const [topic, data] of Object.entries(this.knowledgeIndex)) {
            categories[data.category] = (categories[data.category] || 0) + 1;
        }
        return {
            ...this.stats,
            categories,
            isRunning: this.isRunning,
            queueSize: this.searchQueue.length,
            totalTopics: Object.keys(this.knowledgeIndex).length,
            confidence: Math.min(100, Math.round((this.stats.totalLearned / 500) * 100))
        };
    }

    getAllLearned() {
        return this.knowledgeIndex;
    }

    exportData() {
        return JSON.stringify({
            knowledge: this.knowledgeIndex,
            stats: this.stats,
            processed: [...this.processedSources],
            exportTime: Date.now()
        }, null, 2);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
