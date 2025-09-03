// Background script for TruthLens extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('TruthLens extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
        'truthlens-dark-mode': false,
        'truthlens-api-endpoint': '/api/check'
    });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPopupWithText') {
        // Store the selected text to be used by popup
        chrome.storage.local.set({ 'selectedText': request.text });
        
        // Open the popup (this will trigger the popup to load with the text)
        chrome.action.openPopup();
    } else if (request.action === 'makeApiCall') {
        // Handle API calls from popup (if needed for CORS issues)
        makeApiCall(request.data)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        
        return true; // Keep message channel open for async response
    }
});

// Function to make API calls (useful if popup has CORS issues)
async function makeApiCall(requestData) {
    try {
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically
    // The popup.html will handle the UI
});

// Context menu for right-click fact-checking
chrome.contextMenus.create({
    id: 'truthlens-check-selection',
    title: 'Check with TruthLens',
    contexts: ['selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'truthlens-check-selection') {
        // Store selected text and open popup
        chrome.storage.local.set({ 'selectedText': info.selectionText });
        chrome.action.openPopup();
    }
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('TruthLens service worker started');
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
    chrome.runtime.reload();
});