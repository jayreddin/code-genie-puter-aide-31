
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Chrome, Download, ExternalLink } from "lucide-react";

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose
}) => {
  const handleDownload = () => {
    // Create a zip file with chrome extension files
    const link = document.createElement('a');
    link.href = '/chrome-extension.zip'; // This would be the path to your packaged extension
    link.download = 'puter-code-assistant-chrome-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openChromeStore = () => {
    window.open('https://chrome.google.com/webstore/detail/puter-code-assistant/placeholder-id', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Chrome className="mr-2 h-5 w-5" /> Chrome Extension
          </DialogTitle>
          <DialogDescription>
            Get the Puter Code Assistant Chrome extension to use AI assistance directly in your browser
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button 
            onClick={handleDownload} 
            className="flex items-center justify-center"
            variant="default"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Extension
          </Button>
          
          <Button 
            onClick={openChromeStore} 
            className="flex items-center justify-center"
            variant="outline"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Chrome Web Store
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChromeExtensionModal;
