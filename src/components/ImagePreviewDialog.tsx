
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
}

const ImagePreviewDialog = ({ 
  isOpen, 
  onOpenChange, 
  imageUrl 
}: ImagePreviewDialogProps) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `puter-image-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0">
        {imageUrl && (
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full object-contain max-h-[80vh]" 
            />
            <Button 
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
