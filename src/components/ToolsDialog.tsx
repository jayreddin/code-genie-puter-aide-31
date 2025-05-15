
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Wrench } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ToolsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tools: Tool[];
  onToolsChange: (tools: Tool[]) => void;
}

const ToolsDialog = ({ 
  isOpen, 
  onOpenChange, 
  tools,
  onToolsChange 
}: ToolsDialogProps) => {
  const [localTools, setLocalTools] = useState<Tool[]>(tools);

  const handleToolToggle = (id: string, enabled: boolean) => {
    const updatedTools = localTools.map(tool => 
      tool.id === id ? { ...tool, enabled } : tool
    );
    setLocalTools(updatedTools);
    onToolsChange(updatedTools);
    
    toast({
      title: enabled ? "Tool Enabled" : "Tool Disabled",
      description: `${localTools.find(t => t.id === id)?.name} has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Available Tools
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enable or disable tools that the AI can use to perform tasks.
          </p>
          
          {localTools.map(tool => (
            <div key={tool.id} className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <Label htmlFor={`tool-${tool.id}`} className="text-base font-medium">{tool.name}</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tool.description}
                </p>
              </div>
              <Switch
                id={`tool-${tool.id}`}
                checked={tool.enabled}
                onCheckedChange={(checked) => handleToolToggle(tool.id, checked)}
              />
            </div>
          ))}
          
          {localTools.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400">No tools available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolsDialog;
