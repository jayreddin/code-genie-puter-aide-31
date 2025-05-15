import React, { createContext, useState, useEffect } from 'react';
import { puterAPIService } from '../../services/PuterAPIService';

interface AppContextType {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: any[];
  refreshModels: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType>({
  apiKey: '',
  setApiKey: () => {},
  selectedModel: '',
  setSelectedModel: () => {},
  availableModels: [],
  refreshModels: async () => false,
});

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<any[]>([]);

  useEffect(() => {
    // Load API key from local storage on mount
    const storedApiKey = localStorage.getItem('puterApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    // Load models whenever API key changes
    if (apiKey) {
      refreshModels();
    }
  }, [apiKey]);

  const refreshModels = async (): Promise<boolean> => {
    try {
      // Set the API key in the service
      puterAPIService.setApiKey(apiKey);
      
      // Fetch available models using the service
      const models = await puterAPIService.getAvailableModels();
      setAvailableModels(models);
      
      // If a selected model is no longer available, clear it
      if (selectedModel && !models.find(m => m.id === selectedModel)) {
        setSelectedModel('');
      }
      return true;
    } catch (error) {
      console.error("Failed to refresh models:", error);
      return false;
    }
  };

  const setStoredApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('puterApiKey', newApiKey);
  };

  return (
    <AppContext.Provider value={{
      apiKey,
      setApiKey: setStoredApiKey,
      selectedModel,
      setSelectedModel,
      availableModels,
      refreshModels,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
