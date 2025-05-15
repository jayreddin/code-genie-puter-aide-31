import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/AppHeader';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ChatMessage from '@/components/ChatMessage';
import { aiModels } from '@/data/aiModels';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
}

const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Check if user is already signed in
  useEffect(() => {
    if (typeof window !== 'undefined' && window.puter) {
      if (window.puter.auth.isSignedIn()) {
        setIsAuthenticated(true);
        window.puter.auth.getUser().then(userData => {
          setUser(userData);
        });
      }
    }
  }, []);

  const handleSignIn = async () => {
    try {
      await window.puter.auth.signIn();
      setIsAuthenticated(true);
      const userData = await window.puter.auth.getUser();
      setUser(userData);
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
    setIsLoading(true);

    try {
      // Use Puter AI chat API
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

  const getModelName = (modelId: string) => {
    const model = aiModels.find(model => model.id === modelId);
    return model ? model.name : modelId;
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
              <Button 
                onClick={handleSignIn} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            <span className="text-blue-400">AI</span> Chat
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Model:</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[220px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {Object.entries(aiModels.reduce<Record<string, typeof aiModels>>((groups, model) => {
                    if (!groups[model.provider]) {
                      groups[model.provider] = [];
                    }
                    groups[model.provider].push(model);
                    return groups;
                  }, {})).map(([provider, models]) => (
                    <SelectGroup key={provider}>
                      <SelectLabel>{provider}</SelectLabel>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-normal">Signed in as {user.username}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-[calc(100vh-250px)] overflow-y-auto">
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start chatting with {getModelName(selectedModel)}</p>
            </div>
          )}
          
          {conversation.map((msg) => (
            <ChatMessage 
              key={msg.id}
              content={msg.content}
              isUser={msg.role === 'user'}
              timestamp={msg.timestamp}
              sender={msg.role === 'user' ? 'You' : getModelName(msg.model || selectedModel)}
              onDelete={() => handleDeleteMessage(msg.id)}
              onResend={() => handleResendMessage(msg.id)}
            />
          ))}
          
          {isLoading && (
            <div className="flex space-x-2 mt-4 justify-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex space-x-2">
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask ${getModelName(selectedModel)}...`}
            className="bg-gray-700 border-gray-600 text-white"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt();
              }
            }}
          />
          <Button
            onClick={handleSendPrompt}
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
