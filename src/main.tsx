
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add Puter.js script to the head element
const puterScript = document.createElement('script');
puterScript.src = "https://js.puter.com/v2/";
document.head.appendChild(puterScript);

// Polyfill for puter.ai if running in development environment and puter isn't available
if (typeof window !== 'undefined' && !window.puter) {
  window.puter = {
    ai: {
      chat: async (message, options = {}) => {
        console.log("Mock AI chat called with:", message, options);
        return {
          message: {
            content: `This is a mock response from ${options.model || 'Puter AI'}. In production, this would use the actual Puter AI services.`
          }
        };
      },
      txt2img: async (prompt, testMode = false) => {
        console.log("Mock txt2img called with:", prompt, testMode);
        const img = new Image();
        img.src = "https://via.placeholder.com/300";
        return img;
      },
      img2txt: async (image, testMode = false) => {
        console.log("Mock img2txt called with:", image, testMode);
        return "This is a mock image description from Puter AI.";
      },
      txt2speech: async (text, language = 'en-US', testMode = false) => {
        console.log("Mock txt2speech called with:", text, language, testMode);
        const audio = new Audio();
        audio.src = "https://example.com/mock-audio.mp3";
        return audio;
      }
    },
    fs: {
      read: async () => new Blob(),
      write: async () => ({}),
      delete: async () => true,
      mkdir: async () => ({}),
      readdir: async () => ([]),
      copy: async () => ({}),
      move: async () => ({})
    },
    kv: {
      get: async () => null,
      set: async () => true,
      del: async () => true,
      list: async () => ([]),
      flush: async () => true,
      incr: async () => 1,
      decr: async () => 0
    },
    randName: () => `mock-${Math.random().toString(36).substring(2, 7)}`,
    auth: {
      signIn: async () => {
        console.log("Mock sign in");
        return { username: 'mock-user', uuid: 'mock-uuid' };
      },
      signOut: () => {
        console.log("Mock sign out");
      },
      isSignedIn: () => false,
      getUser: async () => ({ uuid: 'mock-uuid', username: 'mock-user', email_confirmed: true })
    },
    ui: {
      authenticateWithPuter: async () => true
    }
  };
}

createRoot(document.getElementById("root")!).render(<App />);
