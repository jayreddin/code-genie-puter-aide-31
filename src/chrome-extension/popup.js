
import { puterAPIService } from '../services/PuterAPIService.js';

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

// Load available models
async function loadModels() {
  try {
    showStatusMessage('Loading models...', 'info');
    const models = await puterAPIService.getAvailableModels();
    
    // Clear existing options
    modelSelect.innerHTML = '<option value="">Select a model...</option>';
    
    // Add new options
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      modelSelect.appendChild(option);
    });
    
    modelSelect.disabled = false;
    showStatusMessage('Models loaded successfully', 'success');
  } catch (error) {
    showStatusMessage('Failed to load models', 'error');
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
