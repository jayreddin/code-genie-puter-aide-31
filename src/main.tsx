
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
      }
    }
  };
}

createRoot(document.getElementById("root")!).render(<App />);
