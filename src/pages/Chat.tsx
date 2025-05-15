import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/AppHeader';
import { toast } from "@/hooks/use-toast";
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import ImageToTextDialog from '@/components/ImageToTextDialog';
import VisionDialog from '@/components/VisionDialog';
import ImagePlaceholder from '@/components/ImagePlaceholder';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}

const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [isTxtImgMode, setIsTxtImgMode] = useState(false);
  const [isImgTxtDialogOpen, setIsImgTxtDialogOpen] = useState(false);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectRegion, setSelectRegion] = useState(false);
  
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

  // Check if user is already signed in - also check local storage
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
  }, []);

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
          const response = await window.puter.ai.chat(promptText, {
            model: selectedModel
          });

          // Add AI response to conversation
          const assistantMessage: Message = {
            id: Math.random().toString(36).substring(2, 11),
            role: 'assistant',
            content: response.message.content,
            timestamp: new Date(),
            model: selectedModel
          };
          setConversation(prev => [...prev, assistantMessage]);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <AppHeader />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                <span className="text-blue-400">Puter</span> Chat
              </h1>
              <p className="text-gray-400 mt-2">Sign in to access Puter AI capabilities</p>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6">
        <ChatHeader 
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isTxtImgMode={isTxtImgMode}
          toggleTxtImgMode={toggleTxtImgMode}
          openImgTxtDialog={() => setIsImgTxtDialogOpen(true)}
          user={user}
          handleSignOut={handleSignOut}
        />
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-[calc(100vh-250px)] overflow-y-auto">
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.role === 'assistant' ? 'Assistant' : 'You'}: {msg.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-700 text-gray-100">
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
                  type={msg.type}
                  imageUrl={msg.imageUrl}
                />
              );
            }
          })}
          
          {isLoading && !isImageGenerating && (
            <div className="flex space-x-2 mt-4 justify-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{
                animationDelay: '0.2s'
              }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{
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
    </div>
  );
};

export default Chat;
