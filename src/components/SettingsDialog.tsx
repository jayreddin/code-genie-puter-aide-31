
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Settings } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    theme: string;
    streamEnabled: boolean;
    functionCallingEnabled: boolean;
  };
  onSettingsChange: (settings: {
    theme: string;
    streamEnabled: boolean;
    functionCallingEnabled: boolean;
  }) => void;
}

const SettingsDialog = ({ 
  isOpen, 
  onOpenChange, 
  settings,
  onSettingsChange 
}: SettingsDialogProps) => {
  const [localSettings, setLocalSettings] = useState({
    theme: settings.theme,
    streamEnabled: settings.streamEnabled,
    functionCallingEnabled: settings.functionCallingEnabled,
  });

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    toast({
      title: "Settings saved",
      description: "Your settings have been updated.",
    });
    onOpenChange(false);
  };

  // Apply theme preview to dialog content
  useEffect(() => {
    const dialogElem = document.querySelector('[role="dialog"]');
    if (dialogElem) {
      dialogElem.setAttribute('data-theme', localSettings.theme);
    }
  }, [localSettings.theme]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize the application appearance and behavior
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Theme</h3>
            <RadioGroup
              value={localSettings.theme}
              onValueChange={(value) => setLocalSettings({...localSettings, theme: value})}
              className="grid grid-cols-2 gap-2 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sunset" id="theme-sunset" />
                <Label htmlFor="theme-sunset">Sunset</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grey" id="theme-grey" />
                <Label htmlFor="theme-grey">Grey</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multicolored" id="theme-multicolored" />
                <Label htmlFor="theme-multicolored">Multicolored</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Response Streaming */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stream-responses">Response Stream</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable streaming of responses as they're being generated
              </p>
            </div>
            <Switch
              id="stream-responses"
              checked={localSettings.streamEnabled}
              onCheckedChange={(checked) => 
                setLocalSettings({...localSettings, streamEnabled: checked})
              }
            />
          </div>
          
          {/* Function Calling */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="function-calling">Function Calling</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable function calling capabilities for compatible models
              </p>
            </div>
            <Switch
              id="function-calling"
              checked={localSettings.functionCallingEnabled}
              onCheckedChange={(checked) => 
                setLocalSettings({...localSettings, functionCallingEnabled: checked})
              }
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
