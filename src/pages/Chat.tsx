
// I'll update the Chat component to fix the streaming response handling
// and improve theme handling in the application

import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/AppHeader';
import { toast } from "@/hooks/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import ImageToTextDialog from '@/components/ImageToTextDialog';
import VisionDialog from '@/components/VisionDialog';
import ImagePlaceholder from '@/components/ImagePlaceholder';
import SettingsDialog from '@/components/SettingsDialog';
import ToolsDialog from '@/components/ToolsDialog';
import ImagePreviewDialog from '@/components/ImagePreviewDialog';
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}

interface AppSettings {
  theme: string;
  streamEnabled: boolean;
  functionCallingEnabled: boolean;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const Chat = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Chat state
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  
  // Dialog states
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isToolsDialogOpen, setIsToolsDialogOpen] = useState(false);
  const [isImgTxtDialogOpen, setIsImgTxtDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  // Image to text state
  const [extractedText, setExtractedText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectRegion, setSelectRegion] = useState(false);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  
  // Text-to-image mode
  const [isTxtImgMode, setIsTxtImgMode] = useState(false);
  
  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // App settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    streamEnabled: false,
    functionCallingEnabled: false
  });
  
  // Available tools
  const [tools, setTools] = useState<Tool[]>([
    {
      id: "weather",
      name: "Weather",
      description: "Get current weather for a location",
      enabled: true
    },
    {
      id: "calculator",
      name: "Calculator",
      description: "Perform calculations",
      enabled: false
    },
    {
      id: "search",
      name: "Web Search",
      description: "Search the web for information",
      enabled: false
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [conversation]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setPrompt(transcript);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Speech recognition error. Please try again.",
          variant: "destructive"
        });
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      setRecognitionInstance(recognition);
    }
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Check if user is already signed in
  useEffect(() => {
    // First check localStorage
    const savedUser = localStorage.getItem('puterUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse stored user data:", e);
        localStorage.removeItem('puterUser');
      }
    }

    // Then check if user is signed in with Puter
    if (typeof window !== 'undefined' && window.puter) {
      if (window.puter.auth.isSignedIn()) {
        setIsAuthenticated(true);
        window.puter.auth.getUser().then(userData => {
          setUser(userData);
          // Store user data in localStorage
          localStorage.setItem('puterUser', JSON.stringify(userData));
        });
      }
    }
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('puterChatSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
    
    // Load tools from localStorage
    const savedTools = localStorage.getItem('puterChatTools');
    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        console.error("Failed to parse saved tools:", e);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('puterChatSettings', JSON.stringify(settings));
    // Apply theme when settings change
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);
  
  // Save tools to localStorage when they change
  useEffect(() => {
    localStorage.setItem('puterChatTools', JSON.stringify(tools));
  }, [tools]);
  
  // Handle audio player progress updates
  useEffect(() => {
    if (audioPlayer) {
      const updateProgress = () => {
        if (audioPlayer.duration) {
          setAudioProgress((audioPlayer.currentTime / audioPlayer.duration) * 100);
        }
      };
      
      audioPlayer.addEventListener('timeupdate', updateProgress);
      audioPlayer.addEventListener('ended', () => {
        setIsSpeaking(false);
        setAudioProgress(0);
      });
      
      return () => {
        audioPlayer.removeEventListener('timeupdate', updateProgress);
        audioPlayer.removeEventListener('ended', () => {
          setIsSpeaking(false);
          setAudioProgress(0);
        });
      };
    }
  }, [audioPlayer]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      setIsListening(false);
    } else {
      if (recognitionInstance) {
        recognitionInstance.start();
        setIsListening(true);
      } else {
        toast({
          title: "Not Available",
          description: "Speech recognition is not available in your browser.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSignIn = async () => {
    try {
      await window.puter.auth.signIn();
      setIsAuthenticated(true);
      const userData = await window.puter.auth.getUser();
      setUser(userData);
      // Store user data in localStorage
      localStorage.setItem('puterUser', JSON.stringify(userData));
      toast({
        title: "Login successful",
        description: `Welcome, ${userData.username}!`
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "Could not sign in with Puter",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = () => {
    window.puter.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    // Clear user data from localStorage
    localStorage.removeItem('puterUser');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;

    // Create a unique ID for this message
    const messageId = Math.random().toString(36).substring(2, 11);

    // Add user message to conversation
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);
    
    const promptText = prompt;
    setPrompt('');

    // If in text-to-image mode
    if (isTxtImgMode) {
      setIsLoading(true);
      setIsImageGenerating(true);
      
      try {
        // Add placeholder while image is generating
        const placeholderId = Math.random().toString(36).substring(2, 11);
        const placeholderMessage: Message = {
          id: placeholderId,
          role: 'assistant',
          content: "Generating image from: " + promptText,
          timestamp: new Date(),
          model: selectedModel,
          type: 'image'
        };
        setConversation(prev => [...prev, placeholderMessage]);
        
        if (typeof window !== 'undefined' && window.puter) {
          const image = await window.puter.ai.txt2img(promptText);

          // Replace placeholder with actual image
          setConversation(prev => prev.map(msg => 
            msg.id === placeholderId ? {
              ...msg,
              imageUrl: image.src
            } : msg
          ));
        } else {
          // Mock for development
          setTimeout(() => {
            setConversation(prev => prev.map(msg => 
              msg.id === placeholderId ? {
                ...msg,
                imageUrl: "https://via.placeholder.com/300x350?text=Image+Generation+Mock"
              } : msg
            ));
          }, 2000);
        }
      } catch (error) {
        console.error("Failed to generate image:", error);
        toast({
          title: "Error",
          description: "Failed to generate image. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setIsImageGenerating(false);
      }
    } else {
      // Regular text chat
      setIsLoading(true);
      
      try {
        if (typeof window !== 'undefined' && window.puter) {
          // Prepare options for the chat request
          const chatOptions: any = {
            model: selectedModel
          };
          
          // Add streaming if enabled
          if (settings.streamEnabled) {
            chatOptions.stream = true;
          }
          
          // Add tools if function calling is enabled
          if (settings.functionCallingEnabled) {
            chatOptions.tools = tools.filter(t => t.enabled).map(t => {
              // This is a simplified version; in a real app, you would define proper tool schemas
              return {
                type: "function",
                function: {
                  name: t.id,
                  description: t.description,
                  parameters: {
                    type: "object",
                    properties: {
                      query: {
                        type: "string",
                        description: `Input for the ${t.name} tool`
                      }
                    },
                    required: ["query"]
                  }
                }
              };
            });
          }
          
          // Create assistant message placeholder
          const assistantId = Math.random().toString(36).substring(2, 11);
          const assistantMessage: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            model: selectedModel
          };
          
          setConversation(prev => [...prev, assistantMessage]);
          
          if (settings.streamEnabled) {
            // Handle streaming
            const streamResponse = await window.puter.ai.chat(promptText, chatOptions);
            
            // Update the message content as chunks arrive
            let fullContent = '';
            
            try {
              // Fixed: Properly check if streamResponse is async iterable
              if (streamResponse && typeof streamResponse[Symbol.asyncIterator] === 'function') {
                for await (const chunk of streamResponse) {
                  if (chunk?.text) {
                    fullContent += chunk.text;
                    // Update the message with the current content
                    setConversation(prev => prev.map(msg => 
                      msg.id === assistantId ? {
                        ...msg,
                        content: fullContent
                      } : msg
                    ));
                  }
                }
              } else {
                // Fallback for non-streaming responses in streaming mode
                console.warn("Stream response not iterable, falling back to normal response mode");
                const content = streamResponse.message?.content || "Failed to get a streaming response";
                setConversation(prev => prev.map(msg => 
                  msg.id === assistantId ? {
                    ...msg,
                    content: content
                  } : msg
                ));
              }
            } catch (error) {
              console.error("Error streaming response:", error);
              toast({
                title: "Streaming Error",
                description: "Failed to stream the response. Please try again.",
                variant: "destructive"
              });
            }
          } else {
            // Non-streaming response
            const response = await window.puter.ai.chat(promptText, chatOptions);
            
            // Update the assistant message with the response
            setConversation(prev => prev.map(msg => 
              msg.id === assistantId ? {
                ...msg,
                content: response.message.content
              } : msg
            ));
          }
        } else {
          // Mock response for development
          setTimeout(() => {
            const mockResponse: Message = {
              id: Math.random().toString(36).substring(2, 11),
              role: 'assistant',
              content: `This is a mock response since Puter API is not available in this environment. You selected the model: ${selectedModel}`,
              timestamp: new Date(),
              model: selectedModel
            };
            setConversation(prev => [...prev, mockResponse]);
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to get response:", error);
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    // Find the index of the message to delete
    const messageIndex = conversation.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // If it's an assistant message, also delete the user message that triggered it
    if (conversation[messageIndex].role === 'assistant' && messageIndex > 0 && conversation[messageIndex - 1].role === 'user') {
      setConversation(prev => prev.filter((_, idx) => idx !== messageIndex && idx !== messageIndex - 1));
    }
    // If it's a user message, also delete the assistant response
    else if (conversation[messageIndex].role === 'user' && messageIndex + 1 < conversation.length && conversation[messageIndex + 1].role === 'assistant') {
      setConversation(prev => prev.filter((_, idx) => idx !== messageIndex && idx !== messageIndex + 1));
    }
    // Otherwise just delete this message
    else {
      setConversation(prev => prev.filter(msg => msg.id !== messageId));
    }
    
    toast({
      title: "Message deleted",
      description: "Message has been removed from the conversation"
    });
  };

  const handleResendMessage = (messageId: string) => {
    const message = conversation.find(msg => msg.id === messageId);
    if (message && message.role === 'user') {
      setPrompt(message.content);
    } else if (message && message.role === 'assistant') {
      // Find the user message that triggered this response
      const userMessageIndex = conversation.findIndex(msg => msg.id === messageId) - 1;
      if (userMessageIndex >= 0 && conversation[userMessageIndex].role === 'user') {
        setPrompt(conversation[userMessageIndex].content);
      }
    }
  };

  const toggleTxtImgMode = () => {
    setIsTxtImgMode(prev => !prev);
    if (isListening) {
      toggleListening(); // Stop listening if active
    }
  };

  const handleExtractText = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true);
    try {
      let extractedText = "";
      
      if (typeof window !== 'undefined' && window.puter) {
        extractedText = await window.puter.ai.img2txt(selectedImage);
      } else {
        // Mock for development
        extractedText = "This is mock extracted text when Puter API is not available.";
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      }
      
      setExtractedText(extractedText);
      
      // Add to conversation
      const textMessage: Message = {
        id: Math.random().toString(36).substring(2, 11),
        role: 'assistant',
        content: "Extracted text from image:\n\n" + extractedText,
        timestamp: new Date(),
        model: selectedModel
      };
      
      setConversation(prev => [...prev, textMessage]);
    } catch (error) {
      console.error("Failed to extract text:", error);
      toast({
        title: "Error",
        description: "Failed to extract text from image.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToBase64 = () => {
    if (!selectedImage) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      navigator.clipboard.writeText(base64String);
      toast({
        title: "Success",
        description: "Base64 copied to clipboard"
      });
      setIsImgTxtDialogOpen(false);
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleVisionCaptured = (imageData: string, description: string) => {
    // Add captured image to conversation
    const imageMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'user',
      content: "I took this picture:",
      timestamp: new Date(),
      type: 'image',
      imageUrl: imageData
    };
    
    // Add description as assistant message
    const descriptionMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      role: 'assistant',
      content: description,
      timestamp: new Date(),
      model: selectedModel
    };
    
    setConversation(prev => [...prev, imageMessage, descriptionMessage]);
  };
  
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', newSettings.theme);
    
    // If streaming was toggled, update the model to a compatible one
    if (newSettings.streamEnabled !== settings.streamEnabled) {
      // Check if current model is compatible with streaming
      const STREAM_COMPATIBLE_MODELS = [
        "gpt-4o-mini", "gpt-4o", "gpt-4.5-preview",
        "claude-3-7-sonnet", "claude-3-5-sonnet",
        "mistral-large-latest", "pixtral-large-latest", "codestral-latest",
        "grok-beta"
      ];
      
      if (newSettings.streamEnabled && !STREAM_COMPATIBLE_MODELS.includes(selectedModel)) {
        // Switch to a compatible model
        setSelectedModel("gpt-4o-mini");
        toast({
          title: "Model changed",
          description: "Switched to a streaming-compatible model"
        });
      }
    }
    
    // If function calling was toggled, update the model to a compatible one
    if (newSettings.functionCallingEnabled !== settings.functionCallingEnabled) {
      // Check if current model is compatible with function calling
      const FUNCTION_CALLING_MODELS = [
        "gpt-4o-mini", "gpt-4o", "gpt-4.5-preview",
        "claude-3-7-sonnet", "claude-3-5-sonnet"
      ];
      
      if (newSettings.functionCallingEnabled && !FUNCTION_CALLING_MODELS.includes(selectedModel)) {
        // Switch to a compatible model
        setSelectedModel("gpt-4o-mini");
        toast({
          title: "Model changed",
          description: "Switched to a function calling-compatible model"
        });
      }
    }
  };
  
  const handlePlayMessage = (messageId: string) => {
    const message = conversation.find(msg => msg.id === messageId);
    if (message && message.content) {
      if (isSpeaking && audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        setIsSpeaking(false);
        setAudioProgress(0);
      } else {
        if (typeof window !== 'undefined' && window.puter) {
          window.puter.ai.txt2speech(message.content).then(audio => {
            setAudioPlayer(audio);
            audio.play();
            setIsSpeaking(true);
          }).catch(error => {
            console.error("Failed to convert text to speech:", error);
            toast({
              title: "Error",
              description: "Failed to convert text to speech.",
              variant: "destructive"
            });
          });
        } else {
          toast({
            title: "Not Available",
            description: "Text to speech is not available in this environment.",
            variant: "destructive"
          });
        }
      }
    }
  };
  
  const toggleSpeaking = () => {
    if (audioPlayer) {
      if (isSpeaking) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
      setIsSpeaking(!isSpeaking);
    }
  };
  
  const handleImageClick = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setIsImagePreviewOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 text-foreground">
        <AppHeader />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg border border-border">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-400">Puter</span> Chat
              </h1>
              <p className="text-muted-foreground mt-2">Sign in to access Puter AI capabilities</p>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleSignIn} className="w-full bg-blue-600 hover:bg-blue-700">
                Sign in with Puter
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={settings.theme} className="min-h-screen bg-gradient-to-b from-background to-accent/20 text-foreground">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6">
        <ChatHeader 
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isTxtImgMode={isTxtImgMode}
          toggleTxtImgMode={toggleTxtImgMode}
          openImgTxtDialog={() => setIsImgTxtDialogOpen(true)}
          openSettingsDialog={() => setIsSettingsDialogOpen(true)}
          openToolsDialog={() => setIsToolsDialogOpen(true)}
          user={user}
          handleSignOut={handleSignOut}
          settings={settings}
        />
        
        <div className="bg-card rounded-lg p-4 mb-4 h-[calc(100vh-250px)] overflow-y-auto border border-border">
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start chatting with AI</p>
              <p className="text-xs mt-1">{isTxtImgMode ? "Text-to-Image mode is active" : ""}</p>
            </div>
          )}
          
          {conversation.map(msg => {
            if (msg.type === 'image' && !msg.imageUrl) {
              // Show placeholder for images being generated
              return (
                <div key={msg.id} className="mb-4 text-left">
                  <div className="text-xs text-muted-foreground mb-1">
                    {msg.role === 'assistant' ? 'Assistant' : 'You'}: {msg.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-foreground">
                    <div>{msg.content}</div>
                    <ImagePlaceholder isLoading={isImageGenerating} />
                  </div>
                </div>
              );
            } else {
              return (
                <ChatMessage 
                  key={msg.id}
                  content={msg.content}
                  isUser={msg.role === 'user'}
                  timestamp={msg.timestamp}
                  sender={msg.role === 'user' ? 'You' : 'AI'}
                  onDelete={() => handleDeleteMessage(msg.id)}
                  onResend={() => handleResendMessage(msg.id)}
                  onPlay={() => handlePlayMessage(msg.id)}
                  type={msg.type}
                  imageUrl={msg.imageUrl}
                  onImageClick={handleImageClick}
                />
              );
            }
          })}
          
          {isLoading && !isImageGenerating && (
            <div className="flex space-x-2 mt-4 justify-center">
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{
                animationDelay: '0.2s'
              }}></div>
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{
                animationDelay: '0.4s'
              }}></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput 
          prompt={prompt}
          setPrompt={setPrompt}
          handleSendPrompt={handleSendPrompt}
          isLoading={isLoading}
          isListening={isListening}
          toggleListening={toggleListening}
          isTxtImgMode={isTxtImgMode}
          selectedModel={selectedModel}
          openVisionDialog={() => setIsVisionDialogOpen(true)}
          isSpeaking={isSpeaking}
          toggleSpeaking={toggleSpeaking}
          audioProgress={audioProgress}
        />
      </div>
      
      {/* Image to Text Dialog */}
      <ImageToTextDialog 
        isOpen={isImgTxtDialogOpen}
        onOpenChange={setIsImgTxtDialogOpen}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        extractedText={extractedText}
        isLoading={isLoading}
        handleExtractText={handleExtractText}
        handleConvertToBase64={handleConvertToBase64}
        selectRegion={selectRegion}
        setSelectRegion={setSelectRegion}
      />
      
      {/* Vision Dialog */}
      <VisionDialog 
        isOpen={isVisionDialogOpen}
        onOpenChange={setIsVisionDialogOpen}
        onImageCaptured={handleVisionCaptured}
      />
      
      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      
      {/* Tools Dialog */}
      <ToolsDialog
        isOpen={isToolsDialogOpen}
        onOpenChange={setIsToolsDialogOpen}
        tools={tools}
        onToolsChange={setTools}
      />
      
      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        isOpen={isImagePreviewOpen}
        onOpenChange={setIsImagePreviewOpen}
        imageUrl={previewImageUrl}
      />
    </div>
  );
};

export default Chat;
