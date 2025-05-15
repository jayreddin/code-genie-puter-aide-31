
import { puterAPIService } from '../services/PuterAPIService.js';
import { aiModels } from '../data/aiModels.js';

// DOM elements
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyButton = document.getElementById('save-api-key');
const apiStatusElement = document.getElementById('api-status');
const modelSelect = document.getElementById('model-select');
const refreshModelsButton = document.getElementById('refresh-models');
const generateCodeButton = document.getElementById('generate-code');
const debugCodeButton = document.getElementById('debug-code');
const fixCodeButton = document.getElementById('fix-code');
const statusMessageElement = document.getElementById('status-message');
const selectRegionButton = document.getElementById('select-region');
const signInWithPuterButton = document.getElementById('sign-in-puter');

let regionSelectionActive = false;
let browserInfo = {
  name: 'unknown',
  version: 'unknown'
};

// Detect browser
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
  
  browserInfo = {
    name: browserName,
    version: browserVersion
  };
  
  // Add browser info to popup
  const browserInfoElement = document.createElement('div');
  browserInfoElement.textContent = `Browser: ${browserName} ${browserVersion}`;
  browserInfoElement.className = 'browser-info';
  document.querySelector('.container').appendChild(browserInfoElement);
}

// Check if user is already signed in with Puter
function checkPuterAuth() {
  if (window.puter && window.puter.auth.isSignedIn()) {
    window.puter.auth.getUser().then(user => {
      signInWithPuterButton.textContent = `Signed in as ${user.username}`;
      signInWithPuterButton.onclick = handlePuterSignOut;
      
      // If the user has a token stored, that means they successfully authenticated
      chrome.storage.local.get(['puterApiKey'], function(result) {
        if (!result.puterApiKey) {
          // If no API key is stored yet, but user is authenticated,
          // we could potentially get an API key from Puter
          showStatusMessage('Authenticated with Puter. Use this authentication or set API key manually.', 'info');
        }
      });
    });
  } else {
    signInWithPuterButton.textContent = 'Sign in with Puter';
    signInWithPuterButton.onclick = handlePuterSignIn;
  }
}

// Handle Puter sign in
async function handlePuterSignIn() {
  try {
    showStatusMessage('Signing in with Puter...', 'info');
    if (window.puter) {
      await window.puter.auth.signIn();
      const user = await window.puter.auth.getUser();
      signInWithPuterButton.textContent = `Signed in as ${user.username}`;
      signInWithPuterButton.onclick = handlePuterSignOut;
      showStatusMessage('Signed in as ' + user.username, 'success');
    } else {
      throw new Error("Puter API not available");
    }
  } catch (error) {
    console.error("Failed to sign in with Puter:", error);
    showStatusMessage('Failed to sign in with Puter', 'error');
  }
}

// Handle Puter sign out
function handlePuterSignOut() {
  try {
    if (window.puter) {
      window.puter.auth.signOut();
      signInWithPuterButton.textContent = 'Sign in with Puter';
      signInWithPuterButton.onclick = handlePuterSignIn;
      showStatusMessage('Signed out from Puter', 'info');
    }
  } catch (error) {
    console.error("Failed to sign out from Puter:", error);
    showStatusMessage('Failed to sign out from Puter', 'error');
  }
}

// Initialize Puter script
function initializePuter() {
  if (typeof window.puter === 'undefined') {
    const puterScript = document.createElement('script');
    puterScript.src = "https://js.puter.com/v2/";
    puterScript.onload = () => {
      console.log("Puter.js loaded");
      checkPuterAuth();
    };
    document.head.appendChild(puterScript);
  } else {
    checkPuterAuth();
  }
}

// Check if API key is already saved
chrome.storage.local.get(['puterApiKey'], function(result) {
  if (result.puterApiKey) {
    apiKeyInput.value = '••••••••••••••••';
    apiStatusElement.textContent = 'API key configured';
    apiStatusElement.classList.add('success');
    puterAPIService.setApiKey(result.puterApiKey);
    enableInterface();
    loadModels();
  }
  
  // Detect browser and initialize Puter
  detectBrowser();
  initializePuter();
});

// Save API key
saveApiKeyButton.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value;
  if (!apiKey) {
    showStatusMessage('Please enter an API key', 'error');
    return;
  }
  
  try {
    // Validate the API key with a models request
    puterAPIService.setApiKey(apiKey);
    await puterAPIService.getAvailableModels();
    
    // Save API key to Chrome storage
    chrome.storage.local.set({ puterApiKey: apiKey }, function() {
      apiKeyInput.value = '••••••••••••••••';
      apiStatusElement.textContent = 'API key configured';
      apiStatusElement.classList.add('success');
      showStatusMessage('API key saved successfully', 'success');
      enableInterface();
      loadModels();
    });
  } catch (error) {
    apiStatusElement.textContent = 'Invalid API key';
    apiStatusElement.classList.add('error');
    showStatusMessage('Failed to validate API key', 'error');
  }
});

// Populate models from our predefined list
function populateModelSelect() {
  // Clear existing options
  modelSelect.innerHTML = '<option value="">Select a model...</option>';
  
  // Group models by provider
  const groupedModels = aiModels.reduce((groups, model) => {
    if (!groups[model.provider]) {
      groups[model.provider] = [];
    }
    groups[model.provider].push(model);
    return groups;
  }, {});
  
  // Add options grouped by provider
  Object.entries(groupedModels).forEach(([provider, models]) => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = provider;
    
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      optgroup.appendChild(option);
    });
    
    modelSelect.appendChild(optgroup);
  });
  
  modelSelect.disabled = false;
  showStatusMessage('Models loaded from predefined list', 'success');
}

// Load available models from API
async function loadModels() {
  try {
    showStatusMessage('Loading models...', 'info');
    
    // First populate with our predefined list
    populateModelSelect();
    
    // Then try to get from API
    try {
      const models = await puterAPIService.getAvailableModels();
      
      // If successful, update the list
      if (models && models.length > 0) {
        showStatusMessage('Models loaded successfully from API', 'success');
      }
    } catch (error) {
      console.log('Using predefined model list instead of API');
    }
  } catch (error) {
    showStatusMessage('Could not load models from API', 'warning');
  }
}

// Refresh models list
refreshModelsButton.addEventListener('click', loadModels);

// Enable interface
function enableInterface() {
  modelSelect.disabled = false;
  refreshModelsButton.disabled = false;
  generateCodeButton.disabled = false;
  debugCodeButton.disabled = false;
  fixCodeButton.disabled = false;
  selectRegionButton.disabled = false;
}

// Status message display function
function showStatusMessage(message, type) {
  statusMessageElement.textContent = message;
  statusMessageElement.className = type; // 'success', 'error', 'warning', or 'info'
  
  // Clear message after 5 seconds
  setTimeout(() => {
    statusMessageElement.textContent = '';
    statusMessageElement.className = '';
  }, 5000);
}

// Toggle region selection mode
selectRegionButton.addEventListener('click', () => {
  regionSelectionActive = !regionSelectionActive;
  
  if (regionSelectionActive) {
    selectRegionButton.textContent = 'Cancel Selection';
    selectRegionButton.classList.add('active');
    showStatusMessage('Click on a page element to select it', 'info');
    
    // Tell content script to start selection mode
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startElementSelection' });
    });
  } else {
    selectRegionButton.textContent = 'Select Region';
    selectRegionButton.classList.remove('active');
    
    // Tell content script to cancel selection mode
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'cancelElementSelection' });
    });
  }
});

// Generate code action
generateCodeButton.addEventListener('click', async () => {
  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    showStatusMessage('Please select a model', 'warning');
    return;
  }
  
  // Send message to content script to get selected text or cursor position
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getEditorContext' },
      async (response) => {
        if (chrome.runtime.lastError || !response) {
          showStatusMessage('Could not access the page editor', 'error');
          return;
        }
        
        try {
          const { selectedText, surroundingCode, commentAboveCursor } = response;
          const prompt = commentAboveCursor || selectedText || 'Generate code';
          
          showStatusMessage('Generating code...', 'info');
          
          const result = await puterAPIService.generateCode({
            model: selectedModel,
            prompt: prompt,
            context: surroundingCode
          });
          
          // Send generated code back to content script
          chrome.tabs.sendMessage(
            tabs[0].id,
            { 
              action: 'insertGeneratedCode', 
              code: result.generatedCode 
            },
            (response) => {
              if (response && response.success) {
                showStatusMessage('Code inserted successfully', 'success');
              } else {
                showStatusMessage('Could not insert code', 'error');
              }
            }
          );
        } catch (error) {
          showStatusMessage('Failed to generate code', 'error');
        }
      }
    );
  });
});

// Debug code action 
debugCodeButton.addEventListener('click', async () => {
  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    showStatusMessage('Please select a model', 'warning');
    return;
  }
  
  // Similar pattern to generate code
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getEditorContext' },
      async (response) => {
        if (!response) {
          showStatusMessage('Could not access the page editor', 'error');
          return;
        }
        
        try {
          const { selectedText, surroundingCode } = response;
          const codeToDebug = selectedText || surroundingCode;
          
          if (!codeToDebug) {
            showStatusMessage('No code selected to debug', 'warning');
            return;
          }
          
          showStatusMessage('Debugging code...', 'info');
          
          const result = await puterAPIService.debugCode({
            model: selectedModel,
            code: codeToDebug
          });
          
          // Display results in a new tab or panel
          chrome.runtime.sendMessage({ 
            action: 'showDebugResults', 
            results: result 
          });
          
          showStatusMessage('Debug complete', 'success');
        } catch (error) {
          showStatusMessage('Failed to debug code', 'error');
        }
      }
    );
  });
});

// Fix code action (similar pattern to debug)
fixCodeButton.addEventListener('click', async () => {
  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    showStatusMessage('Please select a model', 'warning');
    return;
  }
  
  // Similar implementation to debug code
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getEditorContext' },
      async (response) => {
        if (!response) {
          showStatusMessage('Could not access the page editor', 'error');
          return;
        }
        
        try {
          const { selectedText, surroundingCode } = response;
          const codeToFix = selectedText || surroundingCode;
          
          if (!codeToFix) {
            showStatusMessage('No code selected to fix', 'warning');
            return;
          }
          
          showStatusMessage('Fixing code...', 'info');
          
          const result = await puterAPIService.debugCode({
            model: selectedModel,
            code: codeToFix,
            fix: true
          });
          
          // Send fixed code back to content script
          chrome.tabs.sendMessage(
            tabs[0].id,
            { 
              action: 'insertGeneratedCode', 
              code: result.fixedCode || result.suggestions[0] 
            },
            (response) => {
              if (response && response.success) {
                showStatusMessage('Code fixed successfully', 'success');
              } else {
                showStatusMessage('Could not insert fixed code', 'error');
              }
            }
          );
        } catch (error) {
          showStatusMessage('Failed to fix code', 'error');
        }
      }
    );
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'elementSelected') {
    regionSelectionActive = false;
    selectRegionButton.textContent = 'Select Region';
    selectRegionButton.classList.remove('active');
    showStatusMessage(`Element selected: ${message.selector}`, 'success');
  }
});

// Call these at startup
detectBrowser();
initializePuter();
