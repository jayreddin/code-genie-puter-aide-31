
import React, { useState } from 'react';
import { Copy, MessageSquare, Trash2, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  sender: string;
  onDelete: () => void;
  onResend: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  timestamp,
  sender,
  onDelete,
  onResend,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message has been copied to clipboard",
    });
  };
  
  const handleSpeak = async () => {
    if (!window.puter) {
      toast({
        title: "Not available",
        description: "Text-to-speech is not available in this environment",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSpeaking(true);
      const audio = await window.puter.ai.txt2speech(content);
      audio.play();
      audio.onended = () => setIsSpeaking(false);
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast({
        title: "Speech error",
        description: "Could not convert text to speech",
        variant: "destructive",
      });
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
      <div className="inline-block max-w-[80%] text-left">
        <div className="text-xs text-gray-400 mb-1">
          {sender}: {timestamp.toLocaleTimeString()}
        </div>
        <div 
          className={`p-3 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-100'
          }`}
        >
          {content}
        </div>
        <div className={`flex mt-1 gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onResend} 
            className="h-8 w-8"
            title="Resend"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCopy} 
            className="h-8 w-8"
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDelete}
            className="h-8 w-8"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSpeak} 
            disabled={isSpeaking}
            className="h-8 w-8"
            title="Speak"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
