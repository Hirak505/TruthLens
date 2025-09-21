// Content script for TruthLens extension
(function() {
    'use strict';

    let floatingButton = null;
    let selectedText = '';

    // Create floating action button
    function createFloatingButton() {
        if (floatingButton) return;

        floatingButton = document.createElement('div');
        floatingButton.id = 'truthlens-floating-btn';
        floatingButton.innerHTML = `
            <div class="truthlens-fab">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
        `;

        // Add styles
        const styles = `
            #truthlens-floating-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 999999;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .truthlens-fab {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            
            .truthlens-fab:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4);
            }
            
            .truthlens-fab:active {
                transform: scale(0.95);
            }
            
            #truthlens-floating-btn.hidden {
                opacity: 0;
                transform: scale(0);
                pointer-events: none;
            }
        `;

        // Inject styles
        if (!document.getElementById('truthlens-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'truthlens-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        floatingButton.addEventListener('click', handleFloatingButtonClick);
        document.body.appendChild(floatingButton);
    }

    // Handle text selection
    function handleTextSelection() {
        const selection = window.getSelection();
        selectedText = selection.toString().trim();

        if (selectedText.length > 10) {
            createFloatingButton();
            floatingButton.classList.remove('hidden');
        } else {
            if (floatingButton) {
                floatingButton.classList.add('hidden');
            }
        }
    }

    // Handle floating button click
    function handleFloatingButtonClick() {
        if (selectedText) {
            // Send selected text to extension popup
            chrome.runtime.sendMessage({
                action: 'openPopupWithText',
                text: selectedText
            });
        }
    }

    // Auto-detect and extract article content
    function extractArticleContent() {
        // Try to find main content areas
        const selectors = [
            'article',
            '[role="main"]',
            '.content',
            '.post-content',
            '.article-content',
            '.entry-content',
            '#content',
            'main'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                const text = element.innerText.trim();
                if (text.length > 100) {
                    return text.substring(0, 1000) + '...'; // Limit to first 1000 chars
                }
            }
        }

        // Fallback: get text from body but filter out navigation, ads, etc.
        const bodyText = document.body.innerText;
        return bodyText.substring(0, 1000) + '...';
    }

    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getSelectedText') {
            sendResponse({ text: selectedText });
        } else if (request.action === 'getPageContent') {
            const content = extractArticleContent();
            sendResponse({ 
                content: content,
                url: window.location.href,
                title: document.title
            });
        }
    });

    // Event listeners
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('selectionchange', handleTextSelection);

    // Hide floating button when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (floatingButton && !floatingButton.contains(e.target)) {
            setTimeout(() => {
                const currentSelection = window.getSelection().toString().trim();
                if (!currentSelection && floatingButton) {
                    floatingButton.classList.add('hidden');
                }
            }, 100);
        }
    });

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFloatingButton);
    } else {
        createFloatingButton();
    }

})();