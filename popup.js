// TruthLens Extension - Popup JavaScript

class TruthLensChat {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        
        this.isDarkMode = false;
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.loadDarkMode();
        this.checkForSelectedText();
        this.autoResizeTextarea();
    }

    initializeEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Dark mode toggle
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 100) + 'px';
    }

    async checkForSelectedText() {
        try {
            const result = await chrome.storage.local.get(['selectedText']);
            if (result.selectedText) {
                this.messageInput.value = result.selectedText;
                this.autoResizeTextarea();
                await chrome.storage.local.remove(['selectedText']);
            }
        } catch (error) {
            console.log('No selected text available');
        }
    }

    async loadDarkMode() {
        const result = await chrome.storage.sync.get(['truthlens-dark-mode']);
        if (result['truthlens-dark-mode']) {
            this.toggleDarkMode();
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark', this.isDarkMode);
        
        // Update toggle button
        const lightIcon = this.darkModeToggle.querySelector('.light-icon');
        const darkIcon = this.darkModeToggle.querySelector('.dark-icon');
        
        if (this.isDarkMode) {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
        }

        chrome.storage.sync.set({ 'truthlens-dark-mode': this.isDarkMode });
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || this.isLoading) return;

        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.addUserMessage(text);
        this.showTypingIndicator();
        
        this.isLoading = true;
        this.sendButton.disabled = true;

        try {
            const result = await this.checkCredibility(text);
            this.hideTypingIndicator();
            this.addAIMessage(result);
        } catch (error) {
            this.hideTypingIndicator();
            this.addErrorMessage(error.message);
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
        }
    }

    addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.innerHTML = `
            <div class="message-bubble">
                <p>${this.escapeHtml(text)}</p>
            </div>
        `;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'message ai typing-indicator';
        typingElement.innerHTML = `
            <div class="ai-avatar">AI</div>
            <div class="message-bubble">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    addAIMessage(result) {
        const statusConfig = this.getStatusConfig(result.status);
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai';
        
        messageElement.innerHTML = `
            <div class="ai-avatar">AI</div>
            <div class="message-bubble">
                <div class="credibility-status">
                    <span class="status-icon">${statusConfig.icon}</span>
                    <span class="status-label ${statusConfig.colorClass}">${statusConfig.label}</span>
                </div>
                
                <div class="credibility-score">
                    <div class="score-header">
                        <span>Credibility Score</span>
                        <span class="score-value">${result.score}/100</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${statusConfig.progressClass}"></div>
                    </div>
                </div>
                
                <div class="explanation">${this.escapeHtml(result.explanation)}</div>
                <button class="copy-button">📋 Copy Result</button>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // Animate progress bar
        requestAnimationFrame(() => {
            const progressFill = messageElement.querySelector('.progress-fill');
            progressFill.style.width = `${result.score}%`;
        });

        // Copy button listener
        const copyBtn = messageElement.querySelector('.copy-button');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(result.explanation);
        });
    }

    addErrorMessage(errorMsg) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai';
        messageElement.innerHTML = `
            <div class="ai-avatar">AI</div>
            <div class="message-bubble">
                <div class="credibility-status">
                    <span class="status-icon">❌</span>
                    <span class="status-label status-misinformation">Error</span>
                </div>
                <div class="explanation">
                    Sorry, I couldn't analyze that content right now. ${errorMsg || 'Please try again later.'}
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    async checkCredibility(text) {
        const API_ENDPOINT = 'https://your-api-endpoint.com/api/check';
        
        try {
            // Mock API for demo
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
            
            const statuses = ['trustworthy', 'suspicious', 'misinformation'];
            const weights = [0.4, 0.35, 0.25];
            const randomStatus = this.weightedRandom(statuses, weights);
            
            let score, explanation;
            
            switch (randomStatus) {
                case 'trustworthy':
                    score = Math.floor(Math.random() * 30) + 70;
                    explanation = "This content appears to be trustworthy. It aligns with verified facts and credible sources.";
                    break;
                case 'suspicious':
                    score = Math.floor(Math.random() * 40) + 30;
                    explanation = "This content shows some red flags. It may contain misleading information or lack proper sources.";
                    break;
                case 'misinformation':
                    score = Math.floor(Math.random() * 40);
                    explanation = "This content appears to contain misinformation. Reliable sources contradict these claims.";
                    break;
            }
            
            return { status: randomStatus, score, explanation };
            
        } catch (error) {
            throw new Error('Failed to connect to fact-checking service');
        }
    }

    weightedRandom(items, weights) {
        const cumulative = weights.reduce((acc, w, i) => {
            acc.push((acc[i - 1] || 0) + w);
            return acc;
        }, []);
        const random = Math.random() * cumulative[cumulative.length - 1];
        return items[cumulative.findIndex(c => c >= random)];
    }

    getStatusConfig(status) {
        const configs = {
            trustworthy: { icon: '✅', label: 'Trustworthy', colorClass: 'status-trustworthy', progressClass: 'progress-trustworthy' },
            suspicious: { icon: '⚠️', label: 'Suspicious', colorClass: 'status-suspicious', progressClass: 'progress-suspicious' },
            misinformation: { icon: '❌', label: 'Misinformation', colorClass: 'status-misinformation', progressClass: 'progress-misinformation' }
        };
        return configs[status] || configs.suspicious;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 50);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the chat
document.addEventListener('DOMContentLoaded', () => {
    new TruthLensChat();
});

// Handle messages from background/content script
chrome.runtime.onMessage?.addListener((request) => {
    if (request.action === 'analyzeText') {
        const input = document.getElementById('messageInput');
        if (input) {
            input.value = request.text;
            input.dispatchEvent(new Event('input'));
        }
    }
});
