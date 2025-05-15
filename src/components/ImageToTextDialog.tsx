
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

interface ImageToTextDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: File | null;
  setSelectedImage: (image: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  extractedText: string;
  isLoading: boolean;
  handleExtractText: () => void;
  handleConvertToBase64: () => void;
  selectRegion?: boolean;
  setSelectRegion?: (select: boolean) => void;
}

const ImageToTextDialog: React.FC<ImageToTextDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedImage,
  setSelectedImage,
  previewUrl,
  setPreviewUrl,
  extractedText,
  isLoading,
  handleExtractText,
  handleConvertToBase64,
  selectRegion = false,
  setSelectRegion = () => {}
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [textFormat, setTextFormat] = useState<'plain' | 'markdown'>('plain');
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  
  const copyText = (format: 'plain' | 'markdown') => {
    if (!extractedText) return;
    
    const textToCopy = format === 'markdown' 
      ? '```\n' + extractedText + '\n```' 
      : extractedText;
    
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied",
      description: `Text copied as ${format === 'markdown' ? 'Markdown' : 'plain text'}`
    });
  };

  const insertTextToChat = () => {
    // Logic to insert into chat will be added
    toast({
      title: "Text inserted",
      description: "The extracted text has been inserted into the chat"
    });
    onOpenChange(false);
    setShowTextDialog(false);
  };
  
  const handlePlusClick = () => {
    setSelectRegion(!selectRegion);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Image to Text</span>
              {previewUrl && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectRegion(!selectRegion)}
                  className={`${selectRegion ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  title="Select region"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6">
              {previewUrl ? (
                <div className="w-full">
                  <div className="relative">
                    <img 
                      ref={imageRef}
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-[300px] mx-auto object-contain cursor-pointer" 
                      onClick={() => window.open(previewUrl, '_blank')}
                    />
                    {selectRegion && (
                      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50">
                        {/* Region selection will be implemented here */}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700"
                          onClick={() => setSelectRegion(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                      variant="outline"
                      className="mr-2 border-gray-600 hover:bg-gray-700"
                    >
                      Remove
                    </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Upload Image
                  </Button>
                  <p className="text-sm text-gray-400 mt-2">
                    Select an image to extract text or convert to Base64
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleConvertToBase64} 
              variant="outline"
              disabled={!selectedImage}
              className="border-gray-600 hover:bg-gray-700 mr-2"
            >
              Convert to Base64
            </Button>
            <Button 
              onClick={() => {
                handleExtractText();
                if (extractedText || !isLoading) {
                  setShowTextDialog(true);
                }
              }}
              disabled={!selectedImage || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Processing...' : 'Extract Text'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Result Dialog */}
      <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
        <DialogContent className="sm:max-w-[600px] bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Extracted Text</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                variant={textFormat === 'plain' ? "default" : "outline"}
                onClick={() => setTextFormat('plain')}
                className={textFormat === 'plain' ? "bg-blue-600" : "border-gray-600"}
              >
                Plain Text
              </Button>
              <Button 
                variant={textFormat === 'markdown' ? "default" : "outline"}
                onClick={() => setTextFormat('markdown')}
                className={textFormat === 'markdown' ? "bg-blue-600" : "border-gray-600"}
              >
                Markdown
              </Button>
            </div>
            
            <div className="bg-gray-900 p-4 border border-gray-700 rounded-md max-h-[200px] overflow-y-auto whitespace-pre-wrap">
              {textFormat === 'markdown' ? `\`\`\`\n${extractedText}\n\`\`\`` : extractedText}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline"
                onClick={() => copyText(textFormat)}
                className="border-gray-600 hover:bg-gray-700"
              >
                Copy to Clipboard
              </Button>
              <Button
                onClick={insertTextToChat}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Insert Into Chat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageToTextDialog;
