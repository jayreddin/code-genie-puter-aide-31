
import React, { useContext, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CodeEditor } from 'react-native-code-editor';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { puterAPIService } from '../../services/PuterAPIService';

const CodeEditorScreen = ({ navigation }) => {
  const { apiKey, selectedModel } = useContext(AppContext);
  const [code, setCode] = useState('// Start typing your code here or enter a prompt as a comment\n// Example: // Generate a React component for a todo list\n\n');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const scrollViewRef = useRef(null);
  
  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
    { id: 'cpp', name: 'C++' },
    { id: 'go', name: 'Go' },
    { id: 'rust', name: 'Rust' },
    { id: 'php', name: 'PHP' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'swift', name: 'Swift' },
    { id: 'kotlin', name: 'Kotlin' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' }
  ];
  
  // Redirect to settings if API key is not set
  React.useEffect(() => {
    if (!apiKey) {
      navigation.navigate('Settings', { showApiKeyPrompt: true });
    }
  }, [apiKey, navigation]);

  // Check for model selection
  React.useEffect(() => {
    if (apiKey && !selectedModel) {
      Alert.alert(
        "No Model Selected",
        "Please select a model in Settings to use the AI features.",
        [{ 
          text: "Go to Settings", 
          onPress: () => navigation.navigate('Settings') 
        },
        {
          text: "Later",
          style: "cancel"
        }]
      );
    }
  }, [apiKey, selectedModel, navigation]);

  const extractPromptFromCode = () => {
    // Look for comments in the code to use as prompts
    const lines = code.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*')
    );
    
    if (commentLines.length > 0) {
      // Remove comment markers and clean up
      return commentLines
        .map(line => line.replace(/^\/\/|^#|^\/\*|\*\/$/g, '').trim())
        .join(' ');
    }
    
    // If no comments, use the code itself as context
    return "Help me with this code";
  };

  const handleGenerateCode = async () => {
    if (!apiKey || !selectedModel) {
      Alert.alert(
        "Configuration Required",
        "Please set your API key and select a model in Settings.",
        [{ 
          text: "Go to Settings", 
          onPress: () => navigation.navigate('Settings') 
        }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const prompt = extractPromptFromCode();
      
      const result = await puterAPIService.generateCode({
        model: selectedModel,
        prompt: prompt,
        maxTokens: 1000,
        temperature: 0.7
      });
      
      // Update the code with the generated result
      setCode(result.generatedCode);
    } catch (error) {
      Alert.alert("Error", "Failed to generate code. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugCode = async () => {
    if (!apiKey || !selectedModel) {
      Alert.alert(
        "Configuration Required",
        "Please set your API key and select a model in Settings.",
        [{ 
          text: "Go to Settings", 
          onPress: () => navigation.navigate('Settings') 
        }]
      );
      return;
    }

    if (!code.trim()) {
      Alert.alert("Error", "Please enter some code to debug.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await puterAPIService.debugCode({
        model: selectedModel,
        code: code
      });
      
      // Store the debug results and navigate to results screen
      navigation.navigate('Results', { 
        type: 'debug',
        diagnosis: result.diagnosis,
        suggestions: result.suggestions,
        fixedCode: result.fixedCode,
        originalCode: code
      });
    } catch (error) {
      Alert.alert("Error", "Failed to debug code. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixCode = async () => {
    if (!apiKey || !selectedModel) {
      Alert.alert(
        "Configuration Required",
        "Please set your API key and select a model in Settings.",
        [{ 
          text: "Go to Settings", 
          onPress: () => navigation.navigate('Settings') 
        }]
      );
      return;
    }

    if (!code.trim()) {
      Alert.alert("Error", "Please enter some code to fix.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await puterAPIService.debugCode({
        model: selectedModel,
        code: code,
        error: "Fix this code"
      });
      
      if (result.fixedCode) {
        setCode(result.fixedCode);
        Alert.alert("Success", "Code has been fixed!");
      } else if (result.suggestions && result.suggestions.length > 0) {
        // If no direct fix, use the first suggestion
        setCode(result.suggestions[0]);
        Alert.alert("Partial Fix", "Applied suggested fix to the code.");
      } else {
        Alert.alert("No Issues Found", "The model didn't find any issues to fix.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fix code. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (langId) => {
    setLanguage(langId);
    setShowLanguageSelector(false);
  };

  if (!apiKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Please configure your API key in Settings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.languageSelector}
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
          >
            <Text style={styles.languageText}>
              {languages.find(lang => lang.id === language)?.name || 'JavaScript'}
            </Text>
            <Ionicons
              name={showLanguageSelector ? "chevron-up" : "chevron-down"}
              size={20}
              color="#cdd6f4"
            />
          </TouchableOpacity>

          {showLanguageSelector && (
            <View style={styles.languageDropdown}>
              <ScrollView style={styles.languageScrollView}>
                {languages.map(lang => (
                  <TouchableOpacity
                    key={lang.id}
                    style={[
                      styles.languageOption,
                      language === lang.id && styles.languageOptionSelected
                    ]}
                    onPress={() => changeLanguage(lang.id)}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      language === lang.id && styles.languageOptionTextSelected
                    ]}>
                      {lang.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.editorContainer}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          <CodeEditor
            style={styles.codeEditor}
            language={language}
            theme="vs-dark"
            value={code}
            onChange={setCode}
            showLineNumbers
          />
        </ScrollView>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.buttonDisabled]}
            onPress={handleGenerateCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1e1e2e" size="small" />
            ) : (
              <>
                <Ionicons name="code" size={20} color="#1e1e2e" />
                <Text style={styles.actionButtonText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.debugButton, isLoading && styles.buttonDisabled]}
            onPress={handleDebugCode}
            disabled={isLoading}
          >
            <Ionicons name="bug" size={20} color="#1e1e2e" />
            <Text style={styles.actionButtonText}>Debug</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.fixButton, isLoading && styles.buttonDisabled]}
            onPress={handleFixCode}
            disabled={isLoading}
          >
            <Ionicons name="construct" size={20} color="#1e1e2e" />
            <Text style={styles.actionButtonText}>Fix</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
    zIndex: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    color: '#cdd6f4',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  languageDropdown: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#181825',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#313244',
    zIndex: 20,
    maxHeight: 200,
  },
  languageScrollView: {
    maxHeight: 200,
  },
  languageOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },
  languageOptionSelected: {
    backgroundColor: '#313244',
  },
  languageOptionText: {
    color: '#cdd6f4',
    fontSize: 16,
  },
  languageOptionTextSelected: {
    fontWeight: '600',
    color: '#89b4fa',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#11111b',
  },
  codeEditor: {
    fontSize: 16,
    fontWeight: '400',
    color: '#cdd6f4',
    backgroundColor: '#11111b',
    flex: 1,
    minHeight: 300,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#313244',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugButton: {
    backgroundColor: '#94e2d5',
  },
  fixButton: {
    backgroundColor: '#f5c2e7',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#1e1e2e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateText: {
    color: '#6c7086',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CodeEditorScreen;
