
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Polyfill for puter.ai if running in development environment
if (typeof window !== 'undefined' && !window.puter) {
  window.puter = {
    ai: {
      chat: async (message) => {
        console.log("Mock AI chat called with:", message);
        return {
          message: {
            content: "This is a mock response from Puter AI. In production, this would use the actual Puter AI services."
          }
        };
      },
      txt2img: async (prompt, testMode) => {
        console.log("Mock txt2img called with:", prompt, testMode);
        const img = new Image();
        img.src = "https://via.placeholder.com/300";
        return img;
      },
      img2txt: async (image, testMode) => {
        console.log("Mock img2txt called with:", image, testMode);
        return "This is a mock image description from Puter AI.";
      },
      txt2speech: async (text, language, testMode) => {
        console.log("Mock txt2speech called with:", text, language, testMode);
        const audio = new Audio();
        audio.src = "https://example.com/mock-audio.mp3";
        return audio;
      }
    }
  };
}

createRoot(document.getElementById("root")!).render(<App />);
