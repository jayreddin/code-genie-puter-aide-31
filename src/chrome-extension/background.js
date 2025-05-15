
// Background script for the Chrome extension
// Handles communication between the popup and content scripts

// Initialize state
let state = {
  apiKey: null,
  selectedModel: null,
  editorDetected: false,
  editorType: null,
  selectedElement: null,
  browserInfo: {
    name: "unknown",
    version: "unknown"
  }
};

// Detect browser info
function detectBrowser() {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "";
  
  // Chrome
  if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
    browserName = "Chrome";
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)[1];
  }
  // Firefox
  else if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)[1];
  }
  // Edge
  else if (userAgent.indexOf("Edg") > -1) {
    browserName = "Edge";
    browserVersion = userAgent.match(/Edg\/([0-9.]+)/)[1];
  }
  // Safari
  else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Safari\/([0-9.]+)/)[1];
  }
  // Opera
  else if (userAgent.indexOf("OPR") > -1) {
    browserName = "Opera";
    browserVersion = userAgent.match(/OPR\/([0-9.]+)/)[1];
  }
  
  state.browserInfo = {
    name: browserName,
    version: browserVersion
  };
}

// Load saved state from storage
chrome.storage.local.get(['puterApiKey', 'selectedModel'], (result) => {
  if (result.puterApiKey) {
    state.apiKey = result.puterApiKey;
  }
  
  if (result.selectedModel) {
    state.selectedModel = result.selectedModel;
  }
  
  detectBrowser();
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
    
    case 'elementSelected': {
      // Store selected element info
      state.selectedElement = {
        selector: message.selector,
        tagName: message.tagName,
        pageUrl: message.pageUrl
      };
      // Forward to popup if it's open
      chrome.runtime.sendMessage(message);
      break;
    }
    
    case 'getBrowserInfo': {
      // Return browser info
      sendResponse(state.browserInfo);
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
    state.selectedElement = null;
    
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

// Download the Chrome extension folder when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Create a zip file with the extension contents
    // Note: This is a simplified example - in a real extension, 
    // you would need to implement proper file handling
    console.log('Extension installed - in a real implementation, would download extension files');
  }
});

console.log('Puter Code Assistant background script loaded');
