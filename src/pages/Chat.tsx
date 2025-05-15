import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '@/components/AppHeader';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ChatMessage from '@/components/ChatMessage';
import { aiModels } from '@/data/aiModels';
import { Mic, Image, Text } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [isTxtImgMode, setIsTxtImgMode] = useState(false);
  const [isImgTxtDialogOpen, setIsImgTxtDialogOpen] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const transcript = Array.from(event.results).map((result: any) => result[0]).map((result: any) => result.transcript).join('');
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
    setIsLoading(true);
    try {
      // If in text-to-image mode
      if (isTxtImgMode) {
        if (typeof window !== 'undefined' && window.puter) {
          const image = await window.puter.ai.txt2img(promptText);

          // Add image response
          const imageMessage: Message = {
            id: Math.random().toString(36).substring(2, 11),
            role: 'assistant',
            content: "Generated image from: " + promptText,
            timestamp: new Date(),
            model: selectedModel,
            type: 'image',
            imageUrl: image.src
          };
          setConversation(prev => [...prev, imageMessage]);
        } else {
          // Mock for development
          setTimeout(() => {
            const mockImageMessage: Message = {
              id: Math.random().toString(36).substring(2, 11),
              role: 'assistant',
              content: "Mock image generated from: " + promptText,
              timestamp: new Date(),
              model: selectedModel,
              type: 'image',
              imageUrl: "https://via.placeholder.com/300?text=Image+Generation+Mock"
            };
            setConversation(prev => [...prev, mockImageMessage]);
          }, 1000);
        }
      } else {
        // Regular text chat
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
  const toggleTxtImgMode = () => {
    setIsTxtImgMode(prev => !prev);
    if (isListening) {
      toggleListening(); // Stop listening if active
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedText(""); // Clear any previous extracted text
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
      setIsImgTxtDialogOpen(false);
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
  const copyText = (format: 'plain' | 'markdown') => {
    if (!extractedText) return;
    const textToCopy = format === 'markdown' ? '```\n' + extractedText + '\n```' : extractedText;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied",
      description: `Text copied as ${format === 'markdown' ? 'Markdown' : 'plain text'}`
    });
  };
  const saveImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `puter-image-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
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
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col mb-6">
          
          
          <div className="flex flex-wrap items-center justify-between gap-4 mx-auto w-full max-w-xl">
            <div className="flex items-center gap-2 mx-auto">
              
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[220px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white max-h-[300px]">
                  {Object.entries(aiModels.reduce<Record<string, typeof aiModels>>((groups, model) => {
                  if (!groups[model.provider]) {
                    groups[model.provider] = [];
                  }
                  groups[model.provider].push(model);
                  return groups;
                }, {})).map(([provider, models]) => <SelectGroup key={provider}>
                      <SelectLabel>{provider}</SelectLabel>
                      {models.map(model => <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>)}
                    </SelectGroup>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 mx-auto">
              <Button size="icon" variant={isTxtImgMode ? "default" : "outline"} onClick={toggleTxtImgMode} className={`h-8 w-8 ${isTxtImgMode ? 'animate-pulse border-2 border-green-500' : ''}`} title="Text to Image">
                <Image className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setIsImgTxtDialogOpen(true)} className="h-8 w-8" title="Image to Text">
                <Text className="h-4 w-4" />
              </Button>
            </div>
            
            {user && <div className="flex items-center gap-2 mx-auto">
                <span className="font-normal text-base border-gray-600 hover:bg-gray-700">Signed in as {user.username}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="border-gray-600 text-gray-200 hover:bg-gray-700 \t\nobject-position: right">
                  Sign Out
                </Button>
              </div>}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-[calc(100vh-250px)] overflow-y-auto">
          {conversation.length === 0 && <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Send a message to start chatting with {getModelName(selectedModel)}</p>
              <p className="text-xs mt-1">{isTxtImgMode ? "Text-to-Image mode is active" : ""}</p>
            </div>}
          
          {conversation.map(msg => msg.type === 'image' && msg.imageUrl ? <div key={msg.id} className="mb-4 text-left">
                <div className="text-xs text-gray-400 mb-1">
                  {msg.role === 'user' ? 'You' : getModelName(msg.model || selectedModel)}: {msg.timestamp.toLocaleTimeString()}
                </div>
                <div className="p-3 rounded-lg bg-gray-700 text-gray-100">
                  <div>{msg.content}</div>
                  <div className="relative mt-2">
                    <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden rounded-md">
                      <img src={msg.imageUrl} alt="Generated" className="object-cover w-full cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')} />
                    </AspectRatio>
                    <Button size="sm" className="absolute top-2 right-2 bg-black/50 hover:bg-black/70" onClick={() => saveImage(msg.imageUrl!)}>
                      Save
                    </Button>
                  </div>
                </div>
              </div> : <ChatMessage key={msg.id} content={msg.content} isUser={msg.role === 'user'} timestamp={msg.timestamp} sender={msg.role === 'user' ? 'You' : getModelName(msg.model || selectedModel)} onDelete={() => handleDeleteMessage(msg.id)} onResend={() => handleResendMessage(msg.id)} />)}
          
          {isLoading && <div className="flex space-x-2 mt-4 justify-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{
            animationDelay: '0.2s'
          }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{
            animationDelay: '0.4s'
          }}></div>
            </div>}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex space-x-2 max-w-4xl mx-auto">
          <Button type="button" onClick={toggleListening} className={`px-3 rounded-l-md border-r-0 ${isListening ? 'bg-red-600 hover:bg-red-700 animate-pulse border border-red-500' : 'bg-gray-700 hover:bg-gray-600 text-white'}`} title={isListening ? "Stop recording" : "Start recording"}>
            <Mic className="h-4 w-4" />
          </Button>
          
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={isTxtImgMode ? "Describe the image you want to generate..." : `Ask ${getModelName(selectedModel)}...`} className="bg-gray-700 border-gray-600 text-white rounded-l-none" disabled={isLoading} onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendPrompt();
          }
        }} />
          <Button onClick={handleSendPrompt} disabled={isLoading || !prompt.trim()} className="bg-blue-600 hover:bg-blue-700">
            Send
          </Button>
        </div>
      </div>
      
      {/* Image to Text Dialog */}
      <Dialog open={isImgTxtDialogOpen} onOpenChange={setIsImgTxtDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Image to Text</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6">
              {previewUrl ? <div className="w-full">
                  <img src={previewUrl} alt="Preview" className="max-h-[200px] mx-auto object-contain" />
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => {
                  setSelectedImage(null);
                  setPreviewUrl(null);
                }} variant="outline" className="mr-2">
                      Remove
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Change Image
                    </Button>
                  </div>
                </div> : <div className="text-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Upload Image
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    Select an image to extract text or convert to Base64
                  </p>
                </div>}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            </div>
            
            {extractedText && <div className="border border-gray-600 p-4 rounded-md bg-gray-700">
                <h4 className="font-medium mb-2">Extracted Text:</h4>
                <div className="bg-gray-800 p-2 rounded border border-gray-600 max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                  {extractedText}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => copyText('plain')}>
                    Copy as Text
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyText('markdown')}>
                    Copy as Markdown
                  </Button>
                </div>
              </div>}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImgTxtDialogOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleConvertToBase64} variant="outline" disabled={!selectedImage} className="mr-2">
              Convert to Base64
            </Button>
            <Button onClick={handleExtractText} disabled={!selectedImage || isLoading}>
              {isLoading ? 'Processing...' : 'Extract Text'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Chat;