
import React, { useState, useRef } from 'react';
import { Copy, MessageSquare, Trash2, Volume2, Expand, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  sender: string;
  onDelete: () => void;
  onResend: () => void;
  type?: 'text' | 'image';
  imageUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  timestamp,
  sender,
  onDelete,
  onResend,
  type = 'text',
  imageUrl
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  
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

  const saveImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `puter-image-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image saved",
      description: "Image has been downloaded to your device"
    });
  };

  return (
    <>
      <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className="inline-block max-w-[80%] text-left">
          <div className="text-xs text-gray-400 mb-1">
            {sender}: {timestamp.toLocaleTimeString()}
          </div>
          
          {type === 'image' && imageUrl ? (
            <div className={`p-3 rounded-lg ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
              <div>{content}</div>
              <div className="relative mt-2">
                <AspectRatio ratio={4/3} className="bg-muted overflow-hidden rounded-md">
                  <img 
                    src={imageUrl} 
                    alt="Generated" 
                    className="object-contain w-full h-full cursor-pointer" 
                    style={{ maxWidth: '300px', maxHeight: '350px' }}
                    onClick={() => setIsImageExpanded(true)}
                  />
                </AspectRatio>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button 
                    size="sm" 
                    className="bg-black/50 hover:bg-black/70"
                    onClick={() => setIsImageExpanded(true)}
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-black/50 hover:bg-black/70"
                    onClick={saveImage}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className={`p-3 rounded-lg ${
                isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {content}
            </div>
          )}
          
          <div className={`flex mt-1 gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onResend} 
              className="h-8 w-8 hover:bg-gray-700"
              title="Resend"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCopy} 
              className="h-8 w-8 hover:bg-gray-700"
              title="Copy"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className="h-8 w-8 hover:bg-gray-700"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {type === 'text' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSpeak} 
                disabled={isSpeaking}
                className="h-8 w-8 hover:bg-gray-700"
                title="Speak"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Image Expanded Dialog */}
      <Dialog open={isImageExpanded} onOpenChange={setIsImageExpanded}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] p-1 bg-gray-900 border-gray-700">
          <div className="overflow-auto h-full flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatMessage;
