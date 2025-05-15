
import { puterAPIService } from '../services/PuterAPIService.js';
import { aiModels } from '../data/aiModels.js';
import { BrowserDetectionService } from './services/BrowserDetectionService.js';
import { PuterAuthService } from './services/PuterAuthService.js';
import { SpeechRecognitionService } from './services/SpeechRecognitionService.js';
import { StatusMessageService } from './services/StatusMessageService.js';

// Initialize services
const browserDetectionService = new BrowserDetectionService();
const puterAuthService = new PuterAuthService();
let statusMessageService;
let speechRecognitionService;

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

// State
let regionSelectionActive = false;

// Initialize services that require DOM elements
document.addEventListener('DOMContentLoaded', () => {
  statusMessageService = new StatusMessageService(statusMessageElement);
  speechRecognitionService = new SpeechRecognitionService();
  
  initializeApp();
});

// Main initialization function
async function initializeApp() {
  // Add browser detection info
  const container = document.querySelector('.container');
  const browserInfoElement = browserDetectionService.createBrowserInfoElement('browser-info');
  container.appendChild(browserInfoElement);
  
  // Check stored API key
  chrome.storage.local.get(['puterApiKey'], function(result) {
    if (result.puterApiKey) {
      apiKeyInput.value = '••••••••••••••••';
      apiStatusElement.textContent = 'API key configured';
      apiStatusElement.classList.add('success');
      puterAPIService.setApiKey(result.puterApiKey);
      enableInterface();
      loadModels();
    }
  });
  
  // Check Puter authentication
  initializePuterAuth();
  
  // Set up event listeners
  setupEventListeners();
}

// Check Puter authentication
async function initializePuterAuth() {
  try {
    const user = await puterAuthService.checkAuthStatus();
    updateAuthUI(user);
  } catch (error) {
    console.error("Error checking Puter authentication:", error);
  }
}

// Update auth UI based on authentication state
function updateAuthUI(user) {
  if (user) {
    signInWithPuterButton.textContent = `Signed in as ${user.username}`;
    signInWithPuterButton.onclick = handlePuterSignOut;
    
    // Check if API key is stored
    chrome.storage.local.get(['puterApiKey'], function(result) {
      if (!result.puterApiKey) {
        statusMessageService.info('Authenticated with Puter. Use this authentication or set API key manually.');
      }
    });
  } else {
    signInWithPuterButton.textContent = 'Sign in with Puter';
    signInWithPuterButton.onclick = handlePuterSignIn;
  }
}

// Handle Puter sign in
async function handlePuterSignIn() {
  try {
    statusMessageService.info('Signing in with Puter...');
    const user = await puterAuthService.signIn();
    if (user) {
      updateAuthUI(user);
      statusMessageService.success(`Signed in as ${user.username}`);
    } else {
      throw new Error("Puter API not available");
    }
  } catch (error) {
    console.error("Failed to sign in with Puter:", error);
    statusMessageService.error('Failed to sign in with Puter');
  }
}

// Handle Puter sign out
async function handlePuterSignOut() {
  try {
    await puterAuthService.signOut();
    updateAuthUI(null);
    statusMessageService.info('Signed out from Puter');
  } catch (error) {
    console.error("Failed to sign out from Puter:", error);
    statusMessageService.error('Failed to sign out from Puter');
  }
}

// Set up event listeners
function setupEventListeners() {
  // Save API key
  saveApiKeyButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value;
    if (!apiKey) {
      statusMessageService.error('Please enter an API key');
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
        statusMessageService.success('API key saved successfully');
        enableInterface();
        loadModels();
      });
    } catch (error) {
      apiStatusElement.textContent = 'Invalid API key';
      apiStatusElement.classList.add('error');
      statusMessageService.error('Failed to validate API key');
    }
  });

  // Refresh models
  refreshModelsButton.addEventListener('click', loadModels);

  // Select region
  selectRegionButton.addEventListener('click', toggleRegionSelection);

  // Generate code action
  generateCodeButton.addEventListener('click', handleGenerateCode);

  // Debug code action
  debugCodeButton.addEventListener('click', handleDebugCode);

  // Fix code action
  fixCodeButton.addEventListener('click', handleFixCode);
}

// Enable interface elements
function enableInterface() {
  modelSelect.disabled = false;
  refreshModelsButton.disabled = false;
  generateCodeButton.disabled = false;
  debugCodeButton.disabled = false;
  fixCodeButton.disabled = false;
  selectRegionButton.disabled = false;
}

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
  statusMessageService.success('Models loaded from predefined list');
}

// Load available models
async function loadModels() {
  try {
    statusMessageService.info('Loading models...');
    
    // First populate with our predefined list
    populateModelSelect();
    
    // Then try to get from API
    try {
      const models = await puterAPIService.getAvailableModels();
      
      // If successful, update the list
      if (models && models.length > 0) {
        statusMessageService.success('Models loaded successfully from API');
      }
    } catch (error) {
      console.log('Using predefined model list instead of API');
    }
  } catch (error) {
    statusMessageService.warning('Could not load models from API');
  }
}

// Toggle region selection mode
function toggleRegionSelection() {
  regionSelectionActive = !regionSelectionActive;
  
  if (regionSelectionActive) {
    selectRegionButton.textContent = 'Cancel Selection';
    selectRegionButton.classList.add('active');
    statusMessageService.info('Click on a page element to select it');
    
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
}

// Handle generate code action
async function handleGenerateCode() {
  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    statusMessageService.warning('Please select a model');
    return;
  }
  
  // Send message to content script to get selected text or cursor position
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getEditorContext' },
      async (response) => {
        if (chrome.runtime.lastError || !response) {
          statusMessageService.error('Could not access the page editor');
          return;
        }
        
        try {
          const { selectedText, surroundingCode, commentAboveCursor } = response;
          const prompt = commentAboveCursor || selectedText || 'Generate code';
          
          statusMessageService.info('Generating code...');
          
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
                statusMessageService.success('Code inserted successfully');
              } else {
                statusMessageService.error('Could not insert code');
              }
            }
          );
        } catch (error) {
          statusMessageService.error('Failed to generate code');
        }
      }
    );
  });
}

// Handle debug code action
async function handleDebugCode() {
  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    statusMessageService.warning('Please select a model');
    return;
  }
  
  // Similar pattern to generate code
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getEditorContext' },
      async (response) => {
        if (!response) {
          statusMessageService.error('Could not access the page editor');
          return;
        }
        
        try {
          const { selectedText, surroundingCode } = response;
          const codeToDebug = selectedText || surroundingCode;
          
          if (!codeToDebug) {
            statusMessageService.warning('No code selected to debug');
            return;
          }
          
          statusMessageService.info('Debugging code...');
          
          const result = await puterAPIService.debugCode({
            model: selectedModel,
            code: codeToDebug
          });
          
          // Display results in a new tab or panel
          chrome.runtime.sendMessage({ 
            action: 'showDebugResults', 
            results: result 
          });
          
          statusMessageService.success('Debug complete');
        } catch (error) {
          statusMessageService.error('Failed to debug code');
        }
      }
    );
  });
}

// Handle fix code action
async function handleFixCode() {
  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    statusMessageService.warning('Please select a model');
    return;
  }
  
  // Similar implementation to debug code
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getEditorContext' },
      async (response) => {
        if (!response) {
          statusMessageService.error('Could not access the page editor');
          return;
        }
        
        try {
          const { selectedText, surroundingCode } = response;
          const codeToFix = selectedText || surroundingCode;
          
          if (!codeToFix) {
            statusMessageService.warning('No code selected to fix');
            return;
          }
          
          statusMessageService.info('Fixing code...');
          
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
                statusMessageService.success('Code fixed successfully');
              } else {
                statusMessageService.error('Could not insert fixed code');
              }
            }
          );
        } catch (error) {
          statusMessageService.error('Failed to fix code');
        }
      }
    );
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'elementSelected') {
    regionSelectionActive = false;
    selectRegionButton.textContent = 'Select Region';
    selectRegionButton.classList.remove('active');
    statusMessageService.success(`Element selected: ${message.selector}`);
  }
});
