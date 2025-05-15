
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { apiKey, selectedModel, availableModels } = useContext(AppContext);
  
  // Redirect to settings if no API key
  React.useEffect(() => {
    if (!apiKey) {
      // @ts-ignore
      navigation.navigate('Settings', { showApiKeyPrompt: true });
    }
  }, [apiKey, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Puter Code Assistant</Text>
          <Text style={styles.subtitle}>AI-powered code generation and assistance</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>API Connection:</Text>
            <Text style={[styles.statusValue, apiKey ? styles.statusSuccess : styles.statusError]}>
              {apiKey ? 'Connected' : 'Not Connected'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Selected Model:</Text>
            <Text style={styles.statusValue}>
              {selectedModel ? availableModels.find(m => m.id === selectedModel)?.name || selectedModel : 'None'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, !apiKey && styles.actionButtonDisabled]} 
            onPress={() => navigation.navigate('Code Editor')}
            disabled={!apiKey}
          >
            <Ionicons name="code" size={24} color="#1e1e2e" />
            <Text style={styles.actionButtonText}>Open Code Editor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings" size={24} color="#1e1e2e" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.infoText}>
            Puter Code Assistant helps you generate, debug, and fix code using Puter's AI models. 
            Edit code directly in the app or use the Chrome extension for seamless integration with your favorite web-based IDEs.
          </Text>
          
          <Text style={styles.infoTitle}>Features:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="code" size={18} color="#94e2d5" />
            <Text style={styles.featureText}>Generate code snippets and functions</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bug" size={18} color="#94e2d5" />
            <Text style={styles.featureText}>Debug and fix code issues</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="construct" size={18} color="#94e2d5" />
            <Text style={styles.featureText}>Optimize and improve existing code</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="desktop" size={18} color="#94e2d5" />
            <Text style={styles.featureText}>Chrome extension for web IDE integration</Text>
          </View>
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#94e2d5',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cdd6f4',
    textAlign: 'center',
    marginTop: 8,
  },
  statusCard: {
    backgroundColor: '#181825',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5c2e7',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#cdd6f4',
  },
  statusValue: {
    fontSize: 16,
    color: '#cdd6f4',
    fontWeight: '500',
  },
  statusSuccess: {
    color: '#a6e3a1',
  },
  statusError: {
    color: '#f38ba8',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5c2e7',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonDisabled: {
    backgroundColor: '#313244',
  },
  actionButtonText: {
    color: '#1e1e2e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoContainer: {
    backgroundColor: '#181825',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    color: '#cdd6f4',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  infoTitle: {
    color: '#cdd6f4',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#cdd6f4',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default HomeScreen;
