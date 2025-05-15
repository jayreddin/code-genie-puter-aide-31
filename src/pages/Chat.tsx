
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Use Puter AI chat API
      if (typeof window !== 'undefined' && window.puter) {
        const response = await window.puter.ai.chat(prompt, {
          model: selectedModel
        });
        
        // Add AI response to conversation
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message.content,
          timestamp: new Date()
        };
        
        setConversation(prev => [...prev, assistantMessage]);
        setPrompt('');
      } else {
        setTimeout(() => {
          const mockResponse: Message = {
            role: 'assistant',
            content: "This is a mock response since Puter API is not available in this environment.",
            timestamp: new Date()
          };
          setConversation(prev => [...prev, mockResponse]);
          setPrompt('');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
          <div>
            <span className="text-blue-400 mr-2">Puter</span> Chat Interface
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
        </h1>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <div className="bg-gray-800 rounded-lg p-4 mb-4 h-[calc(100vh-250px)] overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <div className="text-xs text-gray-400 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex space-x-2 mt-4 justify-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your message..."
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
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">AI Model</h3>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value)}
                >
                  <SelectTrigger className="w-full bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 text-white">
                    <SelectItem value="gpt-4o-mini">GPT-4o mini (Default)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4.5-preview">GPT-4.5 preview</SelectItem>
                    <SelectItem value="o1">OpenAI o1</SelectItem>
                    <SelectItem value="o1-mini">OpenAI o1-mini</SelectItem>
                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  Select which AI model to use for generating responses
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Chat;
