
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setThemeState] = useState<string>(() => {
    const savedTheme = localStorage.getItem('puterChatTheme');
    return savedTheme || 'dark';
  });

  // Update theme in localStorage and apply to document when it changes
  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem('puterChatTheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Apply the theme on initial load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider;
