
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CodeEditorScreen from './screens/CodeEditorScreen';
import SettingsScreen from './screens/SettingsScreen';
import ResultsScreen from './screens/ResultsScreen';

// Import context
import { AppContext } from './context/AppContext';
import { puterAPIService } from '../services/PuterAPIService';

// Create tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved API key and selected model
    const loadSettings = async () => {
      try {
        const savedApiKey = await AsyncStorage.getItem('puterApiKey');
        const savedModel = await AsyncStorage.getItem('selectedModel');
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
          puterAPIService.setApiKey(savedApiKey);
          
          // Load models if API key is available
          try {
            const models = await puterAPIService.getAvailableModels();
            setAvailableModels(models);
          } catch (error) {
            console.error('Failed to load models:', error);
          }
        }
        
        if (savedModel) {
          setSelectedModel(savedModel);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Save API key
  const saveApiKey = async (key: string) => {
    try {
      await AsyncStorage.setItem('puterApiKey', key);
      setApiKey(key);
      puterAPIService.setApiKey(key);
      
      // Refresh models after API key change
      try {
        const models = await puterAPIService.getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  // Save selected model
  const saveSelectedModel = async (modelId: string) => {
    try {
      await AsyncStorage.setItem('selectedModel', modelId);
      setSelectedModel(modelId);
    } catch (error) {
      console.error('Error saving selected model:', error);
    }
  };

  // Context value
  const contextValue = {
    apiKey,
    setApiKey: saveApiKey,
    selectedModel,
    setSelectedModel: saveSelectedModel,
    availableModels,
    refreshModels: async () => {
      try {
        const models = await puterAPIService.getAvailableModels();
        setAvailableModels(models);
        return true;
      } catch (error) {
        console.error('Failed to refresh models:', error);
        return false;
      }
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={contextValue}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                
                if (route.name === 'Home') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Code Editor') {
                  iconName = focused ? 'code-slash' : 'code-slash-outline';
                } else if (route.name === 'Results') {
                  iconName = focused ? 'document-text' : 'document-text-outline';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }
                
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#89b4fa',
              tabBarInactiveTintColor: 'gray',
              tabBarStyle: {
                backgroundColor: '#1e1e2e',
                borderTopColor: '#313244',
              },
              headerStyle: {
                backgroundColor: '#1e1e2e',
              },
              headerTintColor: '#cdd6f4',
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Code Editor" component={CodeEditorScreen} />
            <Tab.Screen name="Results" component={ResultsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
