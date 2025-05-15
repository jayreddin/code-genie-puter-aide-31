
// Simple context for mobile app state
import { createContext } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export default AppContext;
