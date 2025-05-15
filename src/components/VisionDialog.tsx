
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VisionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCaptured: (imageData: string, description: string) => void;
}

const VisionDialog = ({ isOpen, onOpenChange, onImageCaptured }: VisionDialogProps) => {
  const [cameraMode, setCameraMode] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize or stop camera when dialog opens/closes
  useEffect(() => {
    if (isOpen && cameraMode) {
      initializeCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraMode, isFrontCamera]);

  const initializeCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera();
      }
      
      const constraints = {
        video: { 
          facingMode: isFrontCamera ? "user" : "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    setIsCapturing(true);
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setCapturedImage(imageData);
      setIsCapturing(true);
    };
    reader.readAsDataURL(file);
  };

  const toggleCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  const describeImage = async () => {
    if (!capturedImage) return;
    
    setIsDescribing(true);
    try {
      let description = "";
      
      if (typeof window !== 'undefined' && window.puter) {
        // Fixed the error by passing the model parameter as an object instead of a string
        const response = await window.puter.ai.chat("Describe this image in detail", capturedImage, { model: "gpt-4o" });
        description = response.message.content;
      } else {
        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1500));
        description = "This is a mock image description since Puter AI is not available.";
      }
      
      // Pass data back to parent
      onImageCaptured(capturedImage, description);
      
      // Reset and close dialog
      resetCapture();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error describing image:", error);
      toast({
        title: "Error",
        description: "Failed to get image description. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDescribing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Camera & Vision</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        {!capturedImage && (
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              variant={cameraMode ? "default" : "outline"} 
              onClick={() => setCameraMode(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button 
              variant={!cameraMode ? "default" : "outline"} 
              onClick={() => setCameraMode(false)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        )}
        
        {cameraMode && !capturedImage && (
          <div className="space-y-4">
            <div className="relative w-full rounded overflow-hidden bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-[300px] object-cover"
              />
              <Button 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={toggleCamera}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={captureImage} className="w-full">
              Take Photo
            </Button>
          </div>
        )}
        
        {!cameraMode && !capturedImage && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Select an image to analyze with AI
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>
        )}
        
        {capturedImage && (
          <div className="space-y-4">
            <div className="rounded overflow-hidden bg-black">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-[300px] object-contain"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetCapture} className="flex-1">
                Try Again
              </Button>
              <Button 
                onClick={describeImage} 
                className="flex-1"
                disabled={isDescribing}
              >
                {isDescribing ? 'Processing...' : 'Describe with AI'}
              </Button>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default VisionDialog;
