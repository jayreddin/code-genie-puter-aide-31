
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { puterAPIService } from '../../services/PuterAPIService';

const SettingsScreen = ({ route }) => {
  const { apiKey, setApiKey, selectedModel, setSelectedModel, availableModels, refreshModels } = useContext(AppContext);
  const [newApiKey, setNewApiKey] = useState(apiKey || '');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show prompt for API key if redirected from home
  React.useEffect(() => {
    if (route.params?.showApiKeyPrompt && !apiKey) {
      Alert.alert(
        "API Key Required",
        "Please enter your Puter API key to use the app.",
        [{ text: "OK" }]
      );
    }
  }, [route.params, apiKey]);

  const handleSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      Alert.alert("Error", "Please enter an API key");
      return;
    }

    setIsLoading(true);
    try {
      // Validate API key
      puterAPIService.setApiKey(newApiKey);
      await puterAPIService.getAvailableModels();
      
      // Save API key if valid
      await setApiKey(newApiKey);
      Alert.alert("Success", "API key saved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to validate API key. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshModels = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshModels();
      if (!success) {
        Alert.alert("Error", "Failed to refresh models. Please check your API key and connection.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Puter API Key</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={isApiKeyVisible ? newApiKey : newApiKey ? '••••••••••••••••' : ''}
                onChangeText={setNewApiKey}
                placeholder="Enter your API key"
                placeholderTextColor="#6c7086"
                secureTextEntry={!isApiKeyVisible}
              />
              <TouchableOpacity
                style={styles.visibilityButton}
                onPress={() => setIsApiKeyVisible(!isApiKeyVisible)}
              >
                <Ionicons 
                  name={isApiKeyVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#cdd6f4"
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSaveApiKey}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1e1e2e" />
              ) : (
                <Text style={styles.buttonText}>Save API Key</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Selection</Text>
          
          {apiKey ? (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Model</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedModel}
                    onValueChange={(value) => setSelectedModel(value)}
                    style={styles.picker}
                    dropdownIconColor="#cdd6f4"
                  >
                    <Picker.Item label="-- Select a model --" value="" />
                    {availableModels.map((model) => (
                      <Picker.Item 
                        key={model.id} 
                        label={model.name} 
                        value={model.id} 
                      />
                    ))}
                  </Picker>
                </View>
                
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, isRefreshing && styles.buttonDisabled]}
                  onPress={handleRefreshModels}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <ActivityIndicator color="#cdd6f4" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={18} color="#cdd6f4" />
                      <Text style={[styles.buttonText, styles.secondaryButtonText]}>Refresh Models</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {selectedModel && availableModels.find(m => m.id === selectedModel) && (
                <View style={styles.modelInfoContainer}>
                  <Text style={styles.modelInfoTitle}>
                    {availableModels.find(m => m.id === selectedModel)?.name}
                  </Text>
                  <Text style={styles.modelInfoDescription}>
                    {availableModels.find(m => m.id === selectedModel)?.description}
                  </Text>
                  <View style={styles.capabilitiesContainer}>
                    <Text style={styles.capabilitiesTitle}>Capabilities:</Text>
                    {availableModels.find(m => m.id === selectedModel)?.capabilities.map((capability, index) => (
                      <View key={index} style={styles.capabilityItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#a6e3a1" />
                        <Text style={styles.capabilityText}>{capability}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.emptyStateText}>
              Please configure your API key first
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Puter Code Assistant v1.0.0{'\n'}
            Powered by Puter.com AI models
          </Text>
          <Text style={styles.copyrightText}>
            © 2025 Puter Code Assistant
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#181825',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5c2e7',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#cdd6f4',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#313244',
    borderRadius: 4,
    backgroundColor: '#11111b',
  },
  input: {
    flex: 1,
    color: '#cdd6f4',
    padding: 12,
    fontSize: 16,
  },
  visibilityButton: {
    padding: 12,
  },
  button: {
    backgroundColor: '#89b4fa',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#1e1e2e',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#89b4fa',
  },
  secondaryButtonText: {
    color: '#cdd6f4',
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#313244',
    borderRadius: 4,
    backgroundColor: '#11111b',
    marginBottom: 12,
  },
  picker: {
    color: '#cdd6f4',
  },
  modelInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#11111b',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#89b4fa',
  },
  modelInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cdd6f4',
    marginBottom: 8,
  },
  modelInfoDescription: {
    fontSize: 14,
    color: '#cdd6f4',
    marginBottom: 12,
    lineHeight: 20,
  },
  capabilitiesContainer: {
    marginTop: 8,
  },
  capabilitiesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#cdd6f4',
    marginBottom: 8,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  capabilityText: {
    fontSize: 14,
    color: '#cdd6f4',
    marginLeft: 8,
  },
  emptyStateText: {
    color: '#6c7086',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  aboutText: {
    color: '#cdd6f4',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  copyrightText: {
    color: '#6c7086',
    fontSize: 12,
  },
});

export default SettingsScreen;
