
// Background script for the Chrome extension
// Handles communication between the popup and content scripts

// Initialize state
let state = {
  apiKey: null,
  selectedModel: null,
  editorDetected: false,
  editorType: null
};

// Load saved state from storage
chrome.storage.local.get(['puterApiKey', 'selectedModel'], (result) => {
  if (result.puterApiKey) {
    state.apiKey = result.puterApiKey;
  }
  
  if (result.selectedModel) {
    state.selectedModel = result.selectedModel;
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'showDebugResults': {
      // Open a new tab to show debug results
      chrome.tabs.create({
        url: chrome.runtime.getURL('debugResults.html')
      }, (tab) => {
        // Store results temporarily to be accessed by the debug results page
        chrome.storage.local.set({ 
          'debugResults': message.results 
        });
      });
      break;
    }
    
    case 'editorDetected': {
      // Update state when an editor is detected by content script
      state.editorDetected = true;
      state.editorType = message.editorType;
      
      // Update icon to show that an editor is available
      chrome.action.setIcon({
        path: {
          '16': 'assets/icon16-active.png',
          '48': 'assets/icon48-active.png',
          '128': 'assets/icon128-active.png'
        },
        tabId: sender.tab.id
      });
      break;
    }
    
    case 'getState': {
      // Return the current state to whoever requested it
      sendResponse(state);
      break;
    }
  }
  
  // Required for async response
  return true;
});

// Reset the editor detection state when navigating to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Reset the editor detection status for this tab
    state.editorDetected = false;
    state.editorType = null;
    
    // Reset the icon to the default
    chrome.action.setIcon({
      path: {
        '16': 'assets/icon16.png',
        '48': 'assets/icon48.png',
        '128': 'assets/icon128.png'
      },
      tabId: tabId
    });
  }
});

// Listen for installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open onboarding page after installation
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html')
    });
  }
});

console.log('Puter Code Assistant background script loaded');
