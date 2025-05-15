
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CodeEditor } from 'react-native-code-editor';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResultsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    // Load saved results
    const loadResults = async () => {
      try {
        const savedResults = await AsyncStorage.getItem('puterResults');
        if (savedResults) {
          setResults(JSON.parse(savedResults));
        }
      } catch (error) {
        console.error('Error loading results:', error);
      }
    };

    loadResults();

    // If route params has new results, save them
    if (route.params) {
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...route.params,
      };

      // Update state and save to storage
      setResults(prevResults => {
        const updatedResults = [newResult, ...prevResults];
        
        // Save to AsyncStorage
        AsyncStorage.setItem('puterResults', JSON.stringify(updatedResults))
          .catch(error => console.error('Error saving results:', error));
        
        return updatedResults;
      });

      // Set the new result as selected
      setSelectedResult(newResult);
    }
  }, [route.params]);

  const handleResultSelect = (result) => {
    setSelectedResult(result);
  };

  const handleClearResults = async () => {
    try {
      await AsyncStorage.removeItem('puterResults');
      setResults([]);
      setSelectedResult(null);
    } catch (error) {
      console.error('Error clearing results:', error);
    }
  };

  const handleUseFixedCode = (fixedCode) => {
    navigation.navigate('Code Editor', { code: fixedCode });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Code Assistant Results</Text>
        {results.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearResults}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#6c7086" />
            <Text style={styles.emptyStateText}>No results yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Results from code generation, debugging, and fixing will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <ScrollView style={styles.resultsList}>
              {results.map(result => (
                <TouchableOpacity
                  key={result.id}
                  style={[
                    styles.resultItem,
                    selectedResult?.id === result.id && styles.resultItemSelected
                  ]}
                  onPress={() => handleResultSelect(result)}
                >
                  <View style={styles.resultItemHeader}>
                    <View style={styles.resultTypeContainer}>
                      <Ionicons
                        name={
                          result.type === 'debug' ? "bug" :
                          result.type === 'fix' ? "construct" : "code"
                        }
                        size={16}
                        color="#cdd6f4"
                      />
                      <Text style={styles.resultType}>
                        {result.type === 'debug' ? "Debug" : 
                         result.type === 'fix' ? "Fix" : "Generate"}
                      </Text>
                    </View>
                    <Text style={styles.resultTimestamp}>
                      {formatTimestamp(result.timestamp)}
                    </Text>
                  </View>
                  
                  {result.diagnosis && (
                    <Text style={styles.resultPreview} numberOfLines={1}>
                      {result.diagnosis}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedResult && (
              <View style={styles.resultDetail}>
                <ScrollView style={styles.resultDetailScroll}>
                  {selectedResult.type === 'debug' && (
                    <>
                      <Text style={styles.detailTitle}>Diagnosis</Text>
                      <View style={styles.diagnosisBox}>
                        <Text style={styles.diagnosisText}>
                          {selectedResult.diagnosis}
                        </Text>
                      </View>

                      <Text style={styles.detailTitle}>Suggestions</Text>
                      {selectedResult.suggestions?.map((suggestion, index) => (
                        <View key={index} style={styles.suggestionItem}>
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </View>
                      ))}

                      {selectedResult.fixedCode && (
                        <>
                          <Text style={styles.detailTitle}>Fixed Code</Text>
                          <CodeEditor
                            style={styles.codeEditor}
                            language="javascript" // Ideally this should match the original code's language
                            theme="vs-dark"
                            value={selectedResult.fixedCode}
                            editable={false}
                            showLineNumbers
                          />
                          <TouchableOpacity
                            style={styles.useCodeButton}
                            onPress={() => handleUseFixedCode(selectedResult.fixedCode)}
                          >
                            <Ionicons name="code-download" size={20} color="#1e1e2e" />
                            <Text style={styles.useCodeButtonText}>Use This Code</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  )}

                  {selectedResult.type === 'generate' && (
                    <>
                      <Text style={styles.detailTitle}>Generated Code</Text>
                      <CodeEditor
                        style={styles.codeEditor}
                        language="javascript"
                        theme="vs-dark"
                        value={selectedResult.generatedCode}
                        editable={false}
                        showLineNumbers
                      />
                      <TouchableOpacity
                        style={styles.useCodeButton}
                        onPress={() => handleUseFixedCode(selectedResult.generatedCode)}
                      >
                        <Ionicons name="code-download" size={20} color="#1e1e2e" />
                        <Text style={styles.useCodeButtonText}>Use This Code</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5c2e7',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#f38ba8',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cdd6f4',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6c7086',
    textAlign: 'center',
    marginTop: 8,
  },
  resultsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  resultsList: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#313244',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
  },
  resultItemSelected: {
    backgroundColor: '#313244',
  },
  resultItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cdd6f4',
    marginLeft: 6,
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#6c7086',
  },
  resultPreview: {
    fontSize: 14,
    color: '#cdd6f4',
    opacity: 0.8,
  },
  resultDetail: {
    flex: 1,
    padding: 16,
  },
  resultDetailScroll: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5c2e7',
    marginBottom: 8,
    marginTop: 16,
  },
  diagnosisBox: {
    padding: 12,
    backgroundColor: '#313244',
    borderRadius: 8,
    marginBottom: 16,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#cdd6f4',
    lineHeight: 20,
  },
  suggestionItem: {
    padding: 12,
    backgroundColor: '#11111b',
    borderLeftWidth: 3,
    borderLeftColor: '#94e2d5',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#cdd6f4',
    lineHeight: 20,
  },
  codeEditor: {
    height: 200,
    fontSize: 14,
    backgroundColor: '#11111b',
    marginVertical: 12,
  },
  useCodeButton: {
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  useCodeButtonText: {
    color: '#1e1e2e',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ResultsScreen;
