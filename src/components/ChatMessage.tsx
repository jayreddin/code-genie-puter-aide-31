
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, RefreshCw, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  sender: string;
  onDelete: () => void;
  onResend: () => void;
  onPlay?: () => void;
  type?: 'text' | 'image';
  imageUrl?: string;
  onImageClick?: (imageUrl: string) => void;
}

const ChatMessage = ({ 
  content, 
  isUser, 
  timestamp, 
  sender, 
  onDelete, 
  onResend,
  onPlay,
  type,
  imageUrl,
  onImageClick
}: ChatMessageProps) => {
  return (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center mb-1 text-xs text-gray-400">
        <span>{sender}: {timestamp.toLocaleTimeString()}</span>
      </div>
      <div className="relative group">
        <div className={`p-3 rounded-lg inline-block max-w-[80%] ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
          {type === 'image' && imageUrl ? (
            <div className="space-y-2">
              <div>{content}</div>
              <div 
                className="w-full cursor-pointer"
                onClick={() => onImageClick && imageUrl && onImageClick(imageUrl)}
              >
                <img 
                  src={imageUrl} 
                  alt="Generated" 
                  className="w-[300px] h-[350px] object-cover rounded"
                />
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>
        
        <div className={`absolute top-0 ${isUser ? 'left-0 transform -translate-x-full' : 'right-0 transform translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              {!isUser && onPlay && type !== 'image' && (
                <DropdownMenuItem onClick={onPlay}>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onResend}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
