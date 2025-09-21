// DOM Elements
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const analysisMode = document.getElementById('analysisMode');
const darkModeToggle = document.getElementById('darkModeToggle');
const openPanelBtn = document.getElementById('openPanelBtn');
const closePanelBtn = document.getElementById('closePanelBtn');
const sidePanel = document.getElementById('sidePanel');
const sidePanelContent = document.getElementById('sidePanelContent');

// --- UI Helpers ---

function appendMessage(content, sender = 'ai') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    if (sender === 'ai') {
        const avatar = document.createElement('div');
        avatar.className = 'ai-avatar';
        avatar.textContent = 'AI';
        messageDiv.appendChild(avatar);
    }
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = content;
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="ai-avatar">AI</div>
        <div class="message-bubble">
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) typingDiv.remove();
}

function renderGeminiResult(result) {
    let html = `
        <h3>Verdict: <span>${result.verdict || "Unknown"}</span></h3>
        <p><strong>Explanation:</strong> ${result.explanation || "No explanation."}</p>
    `;
    if (result.sources && result.sources.length) {
        html += `<h4>Sources:</h4><ul>`;
        result.sources.forEach(src => {
            html += `<li><a href="${src.url}" target="_blank">${src.title}</a></li>`;
        });
        html += `</ul>`;
    }
    return html;
}

// --- Side Panel Logic ---

function openSidePanel(contentHtml) {
    if (contentHtml) sidePanelContent.innerHTML = contentHtml;
    sidePanel.classList.add('open');
}

function closeSidePanel() {
    sidePanel.classList.remove('open');
}

openPanelBtn.addEventListener('click', () => {
    // If already has content, just open; else show last AI result if available
    if (!sidePanelContent.innerHTML) {
        const lastGemini = window._lastGeminiResult;
        if (lastGemini) openSidePanel(renderGeminiResult(lastGemini));
    } else {
        openSidePanel();
    }
});
closePanelBtn.addEventListener('click', closeSidePanel);

// --- Dark Mode ---

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    darkModeToggle.querySelector('.light-icon').style.display = isDark ? 'none' : '';
    darkModeToggle.querySelector('.dark-icon').style.display = isDark ? '' : 'none';
    localStorage.setItem('truthlens-dark', isDark ? '1' : '0');
});
(function restoreDarkMode() {
    if (localStorage.getItem('truthlens-dark') === '1') {
        document.body.classList.add('dark');
        darkModeToggle.querySelector('.light-icon').style.display = 'none';
        darkModeToggle.querySelector('.dark-icon').style.display = '';
    }
})();

// --- Send Message Logic ---

function setInputDisabled(disabled) {
    messageInput.disabled = disabled;
    sendButton.disabled = disabled;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    messageInput.value = '';
    setInputDisabled(true);
    showTypingIndicator();

    try {
        const mode = analysisMode.value || 'hybrid';
        const response = await fetch('http://localhost:3000/api/analyze-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, mode })
        });
        const data = await response.json();
        removeTypingIndicator();

        // Save last Gemini result for side panel
        window._lastGeminiResult = data;

        // Show summary in chat
        let chatHtml = `
            <div class="credibility-status">
                <span class="status-label status-${(data.verdict || data.status || 'unknown').toLowerCase()}">
                    ${data.verdict ? data.verdict.charAt(0).toUpperCase() + data.verdict.slice(1) : (data.status || 'Unknown')}
                </span>
            </div>
            <div class="explanation">${data.explanation || data.summary || 'No explanation.'}</div>
            <button class="copy-button" onclick="navigator.clipboard.writeText('${(data.explanation || data.summary || '').replace(/'/g, "\\'")}')">Copy</button>
            <button class="copy-button" onclick="window.dispatchEvent(new CustomEvent('showGeminiPanel'))">Show Details</button>
        `;
        appendMessage(chatHtml, 'ai');

        // Fill side panel with Gemini result
        openSidePanel(renderGeminiResult(data));
    } catch (err) {
        removeTypingIndicator();
        appendMessage(`<span style="color:#dc2626">Error: ${err.message || 'Failed to analyze.'}</span>`, 'ai');
    } finally {
        setInputDisabled(false);
    }
}

// --- Input Events ---

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// --- Show Gemini Panel from chat button ---
window.addEventListener('showGeminiPanel', () => {
    if (window._lastGeminiResult) {
        openSidePanel(renderGeminiResult(window._lastGeminiResult));
    }
});

// --- Auto-resize textarea ---
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// --- Optional: Focus input on load ---
messageInput.focus();