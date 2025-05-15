
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Upload, X, Square } from "lucide-react";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a preview URL for the image
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };
  
  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Image to Text</DialogTitle>
          <DialogDescription>
            Upload an image to extract text from it
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedImage ? (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (MAX. 10MB)</p>
                </div>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={previewUrl!} 
                alt="Selected" 
                className="w-full h-auto rounded-lg max-h-[300px] object-contain mx-auto"
              />
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  variant="outline"
                  onClick={handleRemoveImage}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectRegion(!selectRegion)}
                  size="sm"
                  className={selectRegion ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Select Region
                </Button>
              </div>
              
              <div className="flex flex-col justify-center mt-5 space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleExtractText}
                    disabled={isLoading}
                    className="flex-1 max-w-[180px]"
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Extract Text'
                    )}
                  </Button>
                  <Button
                    onClick={handleConvertToBase64}
                    variant="outline"
                    className="flex-1 max-w-[180px]"
                  >
                    Convert to Base64
                  </Button>
                </div>
              </div>
              
              {extractedText && (
                <div className="mt-6">
                  <h3 className="mb-2 text-lg font-medium">Extracted Text:</h3>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">{extractedText}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageToTextDialog;
