
import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Text } from "lucide-react";
import { aiModels } from "@/data/aiModels";

interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isTxtImgMode: boolean;
  toggleTxtImgMode: () => void;
  openImgTxtDialog: () => void;
  user: any;
  handleSignOut: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  setSelectedModel,
  isTxtImgMode,
  toggleTxtImgMode,
  openImgTxtDialog,
  user,
  handleSignOut
}) => {
  return (
    <div className="flex justify-between items-center w-full mb-6">
      {/* Text to Image button */}
      <Button 
        size="icon" 
        variant={isTxtImgMode ? "default" : "outline"} 
        onClick={toggleTxtImgMode} 
        className={`h-10 w-10 ${isTxtImgMode ? 'animate-pulse border-2 border-green-500 bg-green-600 hover:bg-green-700' : 'border border-gray-600 bg-gray-700 hover:bg-gray-600'}`}
        title="Text to Image"
      >
        <Image className="h-5 w-5" />
      </Button>
      
      {/* Model Selection */}
      <div className="mx-auto">
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
      
      {/* Image to Text button */}
      <Button 
        size="icon" 
        variant="outline" 
        onClick={openImgTxtDialog} 
        className="h-10 w-10 border border-gray-600 bg-gray-700 hover:bg-gray-600" 
        title="Image to Text"
      >
        <Text className="h-5 w-5" />
      </Button>
      
      {/* User Info and Sign Out */}
      {user && (
        <div className="flex flex-col items-end">
          <div className="px-3 py-1 mb-2 rounded-md border border-gray-600 bg-gray-800 text-sm">
            {user.username}
          </div>
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
  );
};

export default ChatHeader;
