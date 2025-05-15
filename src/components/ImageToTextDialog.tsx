
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Copy, Upload, Check, Plus, Crop } from "lucide-react";

interface ImageToTextDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: File | null;
  setSelectedImage: (image: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  extractedText: string;
  isLoading: boolean;
  handleExtractText: () => Promise<void>;
  handleConvertToBase64: () => void;
  selectRegion: boolean;
  setSelectRegion: (select: boolean) => void;
}

const ImageToTextDialog = ({
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
  selectRegion,
  setSelectRegion
}: ImageToTextDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [showTextExport, setShowTextExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'plain' | 'markdown'>('plain');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const copyText = (format: 'plain' | 'markdown') => {
    if (!extractedText) return;
    
    const textToCopy = format === 'markdown' 
      ? '```\n' + extractedText + '\n```' 
      : extractedText;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    
    toast({
      title: "Copied",
      description: `Text copied as ${format === 'markdown' ? 'Markdown' : 'plain text'}`
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowTextExport = () => {
    setShowTextExport(true);
  };

  const handleInsertIntoChat = () => {
    // This function would be implemented to insert the text into the chat
    toast({
      title: "Inserted",
      description: "Text has been inserted into the chat"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Image to Text</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showTextExport ? (
            <>
              <div className="flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="w-full relative">
                    <div 
                      className={`relative cursor-pointer ${isImageExpanded ? 'max-h-[500px] overflow-y-auto' : 'max-h-[200px] overflow-hidden'}`}
                      onClick={() => setIsImageExpanded(!isImageExpanded)}
                    >
                      <img 
                        ref={imageRef}
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full mx-auto object-contain" 
                      />
                      {!isImageExpanded && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 flex items-end justify-center pb-2">
                          <Button variant="ghost" size="sm">
                            Click to expand
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center mt-4 gap-2">
                      <Button
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl(null);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="sm"
                      >
                        Change Image
                      </Button>
                      <Button
                        onClick={() => setSelectRegion(!selectRegion)}
                        variant={selectRegion ? "default" : "outline"}
                        size="sm"
                      >
                        {selectRegion ? <Crop className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                        Select Region
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center border-2 border-dashed border-gray-300 rounded-lg p-6 w-full">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Select an image to extract text or convert to Base64
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                      const reader = new FileReader();
                      reader.onload = () => {
                        setPreviewUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-center gap-3 mt-4">
                <Button 
                  onClick={handleConvertToBase64} 
                  variant="outline"
                  disabled={!selectedImage || isLoading}
                  className="flex-1"
                >
                  Convert to Base64
                </Button>
                <Button 
                  onClick={() => {
                    handleExtractText().then(() => {
                      if (extractedText) {
                        handleShowTextExport();
                      }
                    });
                  }}
                  disabled={!selectedImage || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : 'Extract Text'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => {
                    setExportFormat('plain');
                    copyText('plain');
                  }}
                  variant={exportFormat === 'plain' ? 'default' : 'outline'}
                >
                  Plain Text
                </Button>
                <Button
                  onClick={() => {
                    setExportFormat('markdown');
                    copyText('markdown');
                  }}
                  variant={exportFormat === 'markdown' ? 'default' : 'outline'}
                >
                  Markdown
                </Button>
              </div>
              
              <div className="border p-4 rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-3 rounded border max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                  {extractedText || "No text could be extracted from this image."}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  onClick={() => setShowTextExport(false)}
                  variant="outline"
                >
                  Back to Image
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyText(exportFormat)}
                    variant="outline"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleInsertIntoChat}>
                    Insert into Chat
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No footer needed as controls are context-sensitive in the body */}
      </DialogContent>
    </Dialog>
  );
};

export default ImageToTextDialog;
