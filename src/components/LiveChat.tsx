
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Mic, Image, Text } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! How can I help you with Puter Code Assistant today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition when component mounts
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
        
        setMessage(transcript);
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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      content: message,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // If in Txt-Img mode, generate an image
      if (isTxtImgMode) {
        if (typeof window !== 'undefined' && window.puter) {
          const image = await window.puter.ai.txt2img(message);
          
          // Add image message to chat
          const imageMessage: Message = {
            content: "Generated image from: " + message,
            isUser: false,
            timestamp: new Date(),
            type: 'image',
            imageUrl: image.src
          };
          
          setMessages(prev => [...prev, imageMessage]);
        } else {
          setTimeout(() => {
            const mockImageMessage: Message = {
              content: "Mock image generated from: " + message,
              isUser: false,
              timestamp: new Date(),
              type: 'image',
              imageUrl: "https://via.placeholder.com/300?text=Image+Generation+Mock"
            };
            setMessages(prev => [...prev, mockImageMessage]);
          }, 1000);
        }
      } else {
        // Regular text chat
        if (typeof window !== 'undefined' && window.puter) {
          const response = await window.puter.ai.chat(message);
          
          // Add AI response to chat
          const assistantMessage: Message = {
            content: response.message.content,
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          // For development environments where puter may not be available
          setTimeout(() => {
            const mockResponse: Message = {
              content: "This is a mock response since Puter API is not available in this environment.",
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, mockResponse]);
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

  const toggleTxtImgMode = () => {
    setIsTxtImgMode(prev => !prev);
    if (isListening) {
      toggleListening(); // Stop listening if it's active
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
      }
      
      setExtractedText(extractedText);
      
      // Add to chat
      const textMessage: Message = {
        content: "Extracted text from image:\n\n" + extractedText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, textMessage]);
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
    
    const textToCopy = format === 'markdown' 
      ? '```\n' + extractedText + '\n```' 
      : extractedText;
    
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

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-message-circle"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-400 mr-1">Puter</span>
                <span className="text-xl font-bold">Chat Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={isTxtImgMode ? "default" : "outline"}
                  onClick={toggleTxtImgMode}
                  className={`h-8 w-8 ${isTxtImgMode ? 'animate-pulse border-2 border-green-500' : ''}`}
                  title="Text to Image"
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsImgTxtDialogOpen(true)}
                  className="h-8 w-8"
                  title="Image to Text"
                >
                  <Text className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4" />
          </DialogHeader>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.type === 'image' && msg.imageUrl ? (
                    <div className="flex flex-col gap-2">
                      <div>{msg.content}</div>
                      <div className="relative">
                        <AspectRatio ratio={1} className="bg-muted overflow-hidden rounded-md">
                          <img 
                            src={msg.imageUrl} 
                            alt="Generated" 
                            className="object-cover w-full cursor-pointer" 
                            onClick={() => window.open(msg.imageUrl, '_blank')}
                          />
                        </AspectRatio>
                        <Button 
                          size="sm" 
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                          onClick={() => saveImage(msg.imageUrl!)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                  <div className={`text-xs mt-1 ${msg.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t flex">
            <Button
              type="button"
              onClick={toggleListening}
              className={`px-3 rounded-l-md border-r-0 ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse border border-red-500' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title={isListening ? "Stop recording" : "Start recording"}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isTxtImgMode ? "Describe the image you want..." : "Type your message..."}
              className="flex-grow px-4 py-2 border rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="rounded-l-none"
              disabled={isLoading}
            >
              Send
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Image to Text Dialog */}
      <Dialog open={isImgTxtDialogOpen} onOpenChange={setIsImgTxtDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Image to Text</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              {previewUrl ? (
                <div className="w-full">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-[200px] mx-auto object-contain" 
                  />
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                      variant="outline"
                      className="mr-2"
                    >
                      Remove
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Upload Image
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Select an image to extract text or convert to Base64
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>
            
            {extractedText && (
              <div className="border p-4 rounded-md bg-gray-50">
                <h4 className="font-medium mb-2">Extracted Text:</h4>
                <div className="bg-white p-2 rounded border max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                  {extractedText}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyText('plain')}
                  >
                    Copy as Text
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyText('markdown')}
                  >
                    Copy as Markdown
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImgTxtDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConvertToBase64} 
              variant="outline"
              disabled={!selectedImage}
              className="mr-2"
            >
              Convert to Base64
            </Button>
            <Button 
              onClick={handleExtractText}
              disabled={!selectedImage || isLoading}
            >
              {isLoading ? 'Processing...' : 'Extract Text'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveChat;
