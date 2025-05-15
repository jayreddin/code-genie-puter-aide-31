
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Camera, CameraOff, Upload, RotateCcw } from "lucide-react";

interface VisionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCaptured: (imageData: string, description: string) => void;
}

const VisionDialog: React.FC<VisionDialogProps> = ({
  isOpen,
  onOpenChange,
  onImageCaptured
}) => {
  const [mode, setMode] = useState<'initial' | 'camera' | 'upload'>('initial');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [frontCamera, setFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);
  
  useEffect(() => {
    if (mode === 'camera' && videoRef.current && !cameraStream) {
      startCamera();
    }
  }, [mode]);
  
  const startCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = { 
        video: { 
          facingMode: frontCamera ? "user" : "environment"
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  const toggleCamera = () => {
    setFrontCamera(!frontCamera);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setCapturedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const describeImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    try {
      if (typeof window !== 'undefined' && window.puter) {
        const response = await window.puter.ai.chat("Describe this image in detail", capturedImage);
        setDescription(response.message.content);
        onImageCaptured(capturedImage, response.message.content);
      } else {
        // Mock for development
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResponse = "This appears to be an image captured from a camera. [Mock description for development]";
        setDescription(mockResponse);
        onImageCaptured(capturedImage, mockResponse);
      }
    } catch (error) {
      console.error("Error getting image description:", error);
      toast({
        title: "Description Error",
        description: "Could not get a description for this image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      onOpenChange(false); // Close the dialog after processing
    }
  };
  
  const resetImage = () => {
    setCapturedImage(null);
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Camera & Vision</DialogTitle>
        </DialogHeader>
        
        {mode === 'initial' && (
          <div className="flex flex-col space-y-4 py-4">
            <Button 
              onClick={() => setMode('camera')}
              className="bg-blue-600 hover:bg-blue-700 flex items-center"
            >
              <Camera className="mr-2 h-5 w-5" />
              Use Camera
            </Button>
            <Button 
              onClick={() => {
                setMode('upload');
                fileInputRef.current?.click();
              }}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700 flex items-center"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </Button>
          </div>
        )}
        
        {mode === 'camera' && !capturedImage && (
          <div className="space-y-4 py-4">
            <div className="relative">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                className="mx-auto rounded-lg border border-gray-600 max-h-[300px]"
              />
              <Button
                size="icon"
                onClick={toggleCamera}
                className="absolute top-2 right-2 bg-gray-800/80 hover:bg-gray-700"
                title="Flip camera"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={captureImage}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Take Screenshot
              </Button>
            </div>
          </div>
        )}
        
        {capturedImage && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="max-h-[300px] mx-auto rounded-lg border border-gray-600"
              />
              <div className="mt-4 flex justify-center space-x-2">
                <Button 
                  onClick={resetImage}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  Retake
                </Button>
                <Button 
                  onClick={describeImage}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? 'Processing...' : 'Describe'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Only show in initial mode after images have been processed */}
        {mode === 'upload' && !capturedImage && (
          <div className="flex justify-center">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              Select Another Image
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisionDialog;
