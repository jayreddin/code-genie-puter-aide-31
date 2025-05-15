
import { createContext } from 'react';
import { PuterModelInfo } from '../../services/PuterAPIService';

interface AppContextType {
  apiKey: string | null;
  setApiKey: (key: string) => Promise<void>;
  selectedModel: string | null;
  setSelectedModel: (modelId: string) => Promise<void>;
  availableModels: PuterModelInfo[];
  refreshModels: () => Promise<boolean>;
}

export const AppContext = createContext<AppContextType>({
  apiKey: null,
  setApiKey: async () => {},
  selectedModel: null,
  setSelectedModel: async () => {},
  availableModels: [],
  refreshModels: async () => false
});
