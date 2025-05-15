
// Main content script to interact with code editors on the page

// Map of known web-based IDEs and their editor selectors/APIs
const KNOWN_EDITORS = {
  'github.com': {
    selector: '.js-file-line-container .CodeMirror',
    type: 'codemirror'
  },
  'codesandbox.io': {
    selector: '.CodeMirror',
    type: 'codemirror'
  },
  'codepen.io': {
    selector: '.CodeMirror',
    type: 'codemirror'
  },
  'replit.com': {
    selector: '.monaco-editor',
    type: 'monaco'
  },
  'stackblitz.com': {
    selector: '.monaco-editor',
    type: 'monaco'
  },
  // Add more editors as needed
};

// Helper to determine which editor is active on the current page
function detectEditor() {
  const host = window.location.hostname;
  
  // Check if we're on a known site
  for (const [site, config] of Object.entries(KNOWN_EDITORS)) {
    if (host.includes(site)) {
      const editorElement = document.querySelector(config.selector);
      if (editorElement) {
        return {
          element: editorElement,
          type: config.type
        };
      }
    }
  }
  
  // Generic detection attempts
  const possibleEditors = [
    { selector: '.CodeMirror', type: 'codemirror' },
    { selector: '.monaco-editor', type: 'monaco' },
    { selector: '[contenteditable="true"]', type: 'contenteditable' },
    { selector: 'textarea.code', type: 'textarea' }
  ];
  
  for (const editor of possibleEditors) {
    const element = document.querySelector(editor.selector);
    if (element) {
      return {
        element,
        type: editor.type
      };
    }
  }
  
  return null;
}

// Get the content from the editor
function getEditorContent(editor) {
  if (!editor) return { text: '', selection: '' };
  
  switch (editor.type) {
    case 'codemirror': {
      // Access CodeMirror instance
      const cm = editor.element.CodeMirror || 
                (editor.element._sourceEditor && editor.element._sourceEditor.codeMirror);
      
      if (!cm) return { text: '', selection: '' };
      
      return {
        text: cm.getValue(),
        selection: cm.getSelection(),
        cursor: cm.getCursor()
      };
    }
    
    case 'monaco': {
      // For Monaco, this is more complex and might require the page to expose the editor
      // This is a simplified approach
      const editorModel = window.monaco?.editor?.getModels()[0];
      if (!editorModel) return { text: '', selection: '' };
      
      return {
        text: editorModel.getValue(),
        selection: editorModel.getValueInRange(window.monaco.editor.getSelection())
      };
    }
    
    case 'contenteditable': {
      const selection = window.getSelection();
      const selectedText = selection.toString();
      
      return {
        text: editor.element.textContent || '',
        selection: selectedText
      };
    }
    
    case 'textarea': {
      const textarea = editor.element;
      const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      
      return {
        text: textarea.value,
        selection: selectedText
      };
    }
    
    default:
      return { text: '', selection: '' };
  }
}

// Insert content into the editor
function insertIntoEditor(editor, content) {
  if (!editor) return false;
  
  switch (editor.type) {
    case 'codemirror': {
      const cm = editor.element.CodeMirror || 
                (editor.element._sourceEditor && editor.element._sourceEditor.codeMirror);
      
      if (!cm) return false;
      
      if (cm.getSelection()) {
        // Replace selection
        cm.replaceSelection(content);
      } else {
        // Insert at cursor
        const cursor = cm.getCursor();
        cm.replaceRange(content, cursor);
      }
      
      return true;
    }
    
    case 'monaco': {
      const editorInstance = window.monaco?.editor?.getEditors()[0];
      if (!editorInstance) return false;
      
      const selection = editorInstance.getSelection();
      
      if (selection && !selection.isEmpty()) {
        // Replace selection
        editorInstance.executeEdits('puter-extension', [{
          range: selection,
          text: content,
          forceMoveMarkers: true
        }]);
      } else {
        // Insert at cursor
        const position = editorInstance.getPosition();
        editorInstance.executeEdits('puter-extension', [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text: content,
          forceMoveMarkers: true
        }]);
      }
      
      return true;
    }
    
    case 'contenteditable': {
      const selection = window.getSelection();
      
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(content));
      }
      
      return true;
    }
    
    case 'textarea': {
      const textarea = editor.element;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      
      const textBefore = textarea.value.substring(0, startPos);
      const textAfter = textarea.value.substring(endPos);
      
      textarea.value = textBefore + content + textAfter;
      textarea.selectionStart = startPos + content.length;
      textarea.selectionEnd = startPos + content.length;
      
      return true;
    }
    
    default:
      return false;
  }
}

// Extract comment above cursor (useful for code generation prompts)
function getCommentAboveCursor(editor) {
  if (!editor) return '';
  
  // This is a simplified implementation - a more robust one would parse the code
  // based on language to find actual comments
  switch (editor.type) {
    case 'codemirror': {
      const cm = editor.element.CodeMirror || 
                (editor.element._sourceEditor && editor.element._sourceEditor.codeMirror);
      
      if (!cm) return '';
      
      const cursor = cm.getCursor();
      let lineIndex = cursor.line;
      let comment = '';
      
      // Look up to 5 lines above for comments
      while (lineIndex > 0 && lineIndex > cursor.line - 5) {
        lineIndex--;
        const line = cm.getLine(lineIndex).trim();
        
        if (line.startsWith('//') || line.startsWith('#')) {
          // Single line comment
          comment = line.substring(line.startsWith('//') ? 2 : 1).trim() + 
                   (comment ? '\n' + comment : '');
        } else if (line.startsWith('/*') || line.startsWith('/**')) {
          // Start of block comment
          comment = line.substring(2).trim() + (comment ? '\n' + comment : '');
          break;
        } else if (line.endsWith('*/')) {
          // End of block comment, we should include it
          comment = line.substring(0, line.length - 2).trim() + 
                   (comment ? '\n' + comment : '');
        } else if (!line || (!line.includes('*/') && !line.startsWith('*'))) {
          // Empty line or not part of a comment, stop looking
          break;
        } else if (line.startsWith('*')) {
          // Middle of block comment
          comment = line.substring(1).trim() + (comment ? '\n' + comment : '');
        }
      }
      
      return comment;
    }
    
    // Similar implementations for other editor types would go here
    
    default:
      return '';
  }
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getEditorContext') {
    const editor = detectEditor();
    if (!editor) {
      sendResponse({ error: 'No editor detected on this page' });
      return;
    }
    
    const content = getEditorContent(editor);
    const commentAboveCursor = getCommentAboveCursor(editor);
    
    sendResponse({
      selectedText: content.selection || '',
      surroundingCode: content.text || '',
      commentAboveCursor: commentAboveCursor
    });
  } 
  else if (message.action === 'insertGeneratedCode') {
    const editor = detectEditor();
    if (!editor) {
      sendResponse({ success: false, error: 'No editor detected on this page' });
      return;
    }
    
    const success = insertIntoEditor(editor, message.code);
    sendResponse({ success });
  }
  
  // Required for async response
  return true;
});

// Observe for editor changes (in case the page loads the editor dynamically)
const observer = new MutationObserver((mutations) => {
  const editor = detectEditor();
  if (editor) {
    // Send a message to the background script that an editor was detected
    chrome.runtime.sendMessage({ 
      action: 'editorDetected', 
      editorType: editor.type 
    });
  }
});

// Start observing
observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

// Notify that the content script is loaded
console.log('Puter Code Assistant content script loaded');
