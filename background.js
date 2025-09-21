// Background script for TruthLens extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('TruthLens extension installed');

    // Set default settings
    chrome.storage.sync.set({
        'truthlens-dark-mode': false,
        'truthlens-api-endpoint': 'https://yourserver.com/api/check'
    });

    // Create context menu
    chrome.contextMenus.create({
        id: 'truthlens-check-selection',
        title: 'Check with TruthLens',
        contexts: ['selection']
    });
});

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPopupWithText') {
        chrome.storage.local.set({ 'selectedText': request.text });

        // Open popup in a small window (instead of chrome.action.openPopup)
        chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 400,
            height: 600
        });
    } 
    else if (request.action === 'makeApiCall') {
        makeApiCall(request.data)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // keep channel open
    }
});

// API call helper
async function makeApiCall(requestData) {
    const API_ENDPOINT = "https://yourserver.com/api/check";
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

// Context menu handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'truthlens-check-selection') {
        chrome.storage.local.set({ 'selectedText': info.selectionText });
        chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 400,
            height: 600
        });
    }
});

// On startup
chrome.runtime.onStartup.addListener(() => {
    console.log('TruthLens service worker started');
});
