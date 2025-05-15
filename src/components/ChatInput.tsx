import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Camera, Play, Pause } from "lucide-react";
interface ChatInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSendPrompt: () => void;
  isLoading: boolean;
  isListening: boolean;
  toggleListening: () => void;
  isTxtImgMode: boolean;
  selectedModel: string;
  openVisionDialog: () => void;
  isSpeaking?: boolean;
  toggleSpeaking?: () => void;
  audioProgress?: number;
}
const ChatInput = ({
  prompt,
  setPrompt,
  handleSendPrompt,
  isLoading,
  isListening,
  toggleListening,
  isTxtImgMode,
  selectedModel,
  openVisionDialog,
  isSpeaking = false,
  toggleSpeaking = () => {},
  audioProgress = 0
}: ChatInputProps) => {
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';

      // Set new height based on scrollHeight with a max of 5 rows
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // Approximate line height
      const maxRows = 5;
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / lineHeight), 1), maxRows);
      setRows(newRows);
      textareaRef.current.style.height = `${newRows * lineHeight}px`;
    }
  }, [prompt]);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        handleSendPrompt();
      }
    }
  };
  return <div className="relative">
      <div className="flex">
        <div className="flex flex-col mr-2 space-y-2">
          <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleListening} className={`h-10 w-10 ${isListening ? 'animate-pulse border-2 border-red-500' : ''}`}>
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button type="button" size="icon" variant="outline" onClick={openVisionDialog} className="h-10 w-10">
            <Camera className="h-4 w-4" />
          </Button>
          
          {isSpeaking && <Button type="button" size="icon" variant="outline" onClick={toggleSpeaking} className="h-10 w-10">
              {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>}
        </div>
        
        <div className="flex-1 relative">
          <Textarea ref={textareaRef} value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder={isTxtImgMode ? "Describe the image you want to create..." : "Type a message..."} rows={rows} disabled={isLoading} className="min-h-[88px] resize-none " />
          
          {isSpeaking && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
              <div className="h-1 bg-blue-500 transition-all duration-300 ease-in-out" style={{
            width: `${audioProgress}%`
          }}></div>
            </div>}
          
          <Button type="button" size="icon" variant="ghost" className="absolute right-2 top-[7px]" onClick={handleSendPrompt} disabled={isLoading || !prompt.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isTxtImgMode && <div className="text-xs text-gray-500 mt-1 ml-12">
          Image generation mode is active. Your prompt will create an image using {selectedModel}.
        </div>}
    </div>;
};
export default ChatInput;