import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Image, Text, LogOut, Settings, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Group models by provider
const MODEL_PROVIDERS = {
  "OpenAI": ["gpt-4o-mini", "gpt-4o", "gpt-4.5-preview"],
  "Anthropic": ["claude-3-7-sonnet", "claude-3-5-sonnet"],
  "Google": ["gemini-2.0-flash", "gemini-1.5-flash"],
  "Mistral": ["mistral-large-latest", "pixtral-large-latest", "codestral-latest"],
  "Meta": ["meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo"],
  "DeepSeek": ["deepseek-chat", "deepseek-reasoner"],
  "Others": ["o1", "o1-mini", "o1-pro", "o3", "o3-mini", "o4-mini", "google/gemma-2-27b-it", "grok-beta"]
};

// Models that support streaming
const STREAM_COMPATIBLE_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.5-preview", "claude-3-7-sonnet", "claude-3-5-sonnet", "mistral-large-latest", "pixtral-large-latest", "codestral-latest", "grok-beta"];

// Models that support function calling
const FUNCTION_CALLING_MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.5-preview", "claude-3-7-sonnet", "claude-3-5-sonnet"];
interface ChatHeaderProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isTxtImgMode: boolean;
  toggleTxtImgMode: () => void;
  openImgTxtDialog: () => void;
  openSettingsDialog: () => void;
  openToolsDialog: () => void;
  user: any;
  handleSignOut: () => void;
  settings: {
    streamEnabled: boolean;
    functionCallingEnabled: boolean;
  };
}
const ChatHeader = ({
  selectedModel,
  setSelectedModel,
  isTxtImgMode,
  toggleTxtImgMode,
  openImgTxtDialog,
  openSettingsDialog,
  openToolsDialog,
  user,
  handleSignOut,
  settings
}: ChatHeaderProps) => {
  // Filter models based on settings
  const getFilteredModels = () => {
    let filteredModels = {
      ...MODEL_PROVIDERS
    };
    if (settings.streamEnabled) {
      // Filter to only show stream compatible models
      Object.keys(filteredModels).forEach(provider => {
        filteredModels[provider] = filteredModels[provider].filter(model => STREAM_COMPATIBLE_MODELS.includes(model));
      });
    }
    if (settings.functionCallingEnabled) {
      // Filter to only show function calling compatible models
      Object.keys(filteredModels).forEach(provider => {
        filteredModels[provider] = filteredModels[provider].filter(model => FUNCTION_CALLING_MODELS.includes(model));
      });
    }

    // Remove empty providers
    Object.keys(filteredModels).forEach(provider => {
      if (filteredModels[provider].length === 0) {
        delete filteredModels[provider];
      }
    });
    return filteredModels;
  };
  const filteredModels = getFilteredModels();
  return <div className="flex flex-col mb-6">
      <div className="flex items-center justify-between mb-2">
        
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={toggleTxtImgMode} variant={isTxtImgMode ? "default" : "outline"} className={`${isTxtImgMode ? 'bg-green-600 hover:bg-green-700 border-2 border-green-500 animate-pulse' : ''}`} size="sm">
            <Image className="h-4 w-4 mr-2" />
            Text to Image
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-center" size="sm">
                {selectedModel.split('/').pop() || selectedModel}
                {settings.streamEnabled && <Badge variant="outline" className="ml-2 text-xs">Stream</Badge>}
                {settings.functionCallingEnabled && <Badge variant="outline" className="ml-2 text-xs">Function</Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[240px] max-h-[400px] overflow-y-auto">
              {Object.keys(filteredModels).map(provider => <React.Fragment key={provider}>
                  <DropdownMenuLabel className="text-center font-semibold text-blue-500">{provider}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {filteredModels[provider].map(model => <DropdownMenuItem key={model} className={`text-center justify-center ${selectedModel === model ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''}`} onClick={() => setSelectedModel(model)}>
                        {model.split('/').pop() || model}
                      </DropdownMenuItem>)}
                  </DropdownMenuGroup>
                  {Object.keys(filteredModels).indexOf(provider) < Object.keys(filteredModels).length - 1 && <DropdownMenuSeparator />}
                </React.Fragment>)}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={openImgTxtDialog} variant="outline" size="sm">
            <Text className="h-4 w-4 mr-2" />
            Image to Text
          </Button>
          
          <Button onClick={openSettingsDialog} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          {settings.functionCallingEnabled && <Button onClick={openToolsDialog} variant="outline" size="sm">
              <Wrench className="h-4 w-4 mr-2" />
              Tools
            </Button>}
        </div>
        
        <div className="flex flex-col items-end">
          {user && <div className="text-sm border border-gray-300 rounded-lg px-3 py-1 mb-2">
              {user.username}
            </div>}
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>;
};
export default ChatHeader;