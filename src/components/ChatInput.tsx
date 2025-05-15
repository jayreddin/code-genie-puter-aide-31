
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Mic } from "lucide-react";

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
}

const ChatInput: React.FC<ChatInputProps> = ({
  prompt,
  setPrompt,
  handleSendPrompt,
  isLoading,
  isListening,
  toggleListening,
  isTxtImgMode,
  selectedModel,
  openVisionDialog
}) => {
  const getModelName = (modelId: string) => {
    const model = aiModels.find(model => model.id === modelId);
    return model ? model.name : modelId;
  };

  return (
    <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
      <div className="flex space-x-2">
        <div className="flex flex-col space-y-2">
          <Button 
            type="button" 
            onClick={toggleListening} 
            className={`px-3 rounded-l-md border-r-0 ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse border border-red-500' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isListening ? "Stop recording" : "Start recording"}
          >
            <Mic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            onClick={openVisionDialog}
            className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white"
            title="Camera & Vision"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        <Textarea 
          value={prompt} 
          onChange={e => setPrompt(e.target.value)} 
          placeholder={isTxtImgMode ? "Describe the image you want to generate..." : `Ask ${getModelName(selectedModel)}...`} 
          className="bg-gray-700 border-gray-600 text-white rounded-l-none resize-none min-h-[80px]" 
          disabled={isLoading}
          onKeyDown={e => {
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
  );
};

// Import at the top
import { aiModels } from "@/data/aiModels";

export default ChatInput;
