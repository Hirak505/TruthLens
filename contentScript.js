// Only inject once
if (!window.__truthlens_sidepanel) {
    window.__truthlens_sidepanel = true;

    // Create side panel container
    const panel = document.createElement('div');
    panel.id = 'truthlens-sidepanel';
    panel.innerHTML = `
        <div class="tlsp-header">
            <span>TruthLens Gemini</span>
            <button id="tlsp-close">&times;</button>
        </div>
        <div class="tlsp-messages" id="tlsp-messages"></div>
        <div class="tlsp-input">
            <textarea id="tlsp-input" placeholder="Paste text or link to fact-check..."></textarea>
            <button id="tlsp-send">Send</button>
        </div>
    `;
    document.body.appendChild(panel);

    // CSS for the panel (or use sidepanel.css)
    const style = document.createElement('style');
    style.textContent = `
        #truthlens-sidepanel {
            position: fixed;
            top: 0; right: 0;
            width: 370px; height: 100vh;
            background: #fff;
            border-left: 1px solid #ddd;
            box-shadow: -2px 0 16px rgba(0,0,0,0.13);
            z-index: 999999;
            display: flex; flex-direction: column;
            font-family: system-ui,sans-serif;
        }
        .tlsp-header {
            background: #f5f5f5;
            padding: 12px 16px;
            font-weight: bold;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #ddd;
        }
        .tlsp-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }
        .tlsp-input {
            display: flex;
            border-top: 1px solid #eee;
            padding: 10px;
            background: #fafbfc;
        }
        #tlsp-input {
            flex: 1;
            resize: none;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 1em;
        }
        #tlsp-send {
            margin-left: 8px;
            padding: 8px 16px;
            border: none;
            background: #2563eb;
            color: #fff;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
        }
        #tlsp-close {
            background: none;
            border: none;
            font-size: 1.5em;
            cursor: pointer;
        }
        .tlsp-msg-user { margin-bottom: 10px; }
        .tlsp-msg-ai { margin-bottom: 18px; background: #f1f5f9; border-radius: 8px; padding: 10px; }
        .tlsp-msg-ai strong { color: #2563eb; }
    `;
    document.head.appendChild(style);

    // Close button
    document.getElementById('tlsp-close').onclick = () => {
        panel.style.display = 'none';
    };

    // Send button
    document.getElementById('tlsp-send').onclick = sendMessage;
    document.getElementById('tlsp-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    function appendMessage(content, sender = 'ai') {
        const msgDiv = document.createElement('div');
        msgDiv.className = sender === 'user' ? 'tlsp-msg-user' : 'tlsp-msg-ai';
        msgDiv.innerHTML = content;
        document.getElementById('tlsp-messages').appendChild(msgDiv);
        document.getElementById('tlsp-messages').scrollTop = 99999;
    }

    async function sendMessage() {
        const input = document.getElementById('tlsp-input');
        const text = input.value.trim();
        if (!text) return;
        appendMessage(`<strong>You:</strong> ${text}`, 'user');
        input.value = '';
        appendMessage(`<em>Analyzing...</em>`, 'ai');
        try {
            const response = await fetch('http://localhost:3000/api/analyze-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, mode: 'hybrid' })
            });
            const data = await response.json();
            // Remove "Analyzing..." message
            const msgs = document.querySelectorAll('.tlsp-msg-ai');
            if (msgs.length) msgs[msgs.length-1].remove();
            // Show Gemini result
            let html = `<strong>Verdict:</strong> ${data.verdict || 'Unknown'}<br>
                        <strong>Explanation:</strong> ${data.explanation || 'No explanation.'}`;
            if (data.sources && data.sources.length) {
                html += `<br><strong>Sources:</strong><ul>`;
                data.sources.forEach(src => {
                    html += `<li><a href="${src.url}" target="_blank">${src.title}</a></li>`;
                });
                html += `</ul>`;
            }
            appendMessage(html, 'ai');
        } catch (err) {
            appendMessage(`<span style="color:#dc2626">Error: ${err.message || 'Failed to analyze.'}</span>`, 'ai');
        }
    }
}