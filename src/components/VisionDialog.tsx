
// Fix error reported: Expected 1-2 arguments, but got 3

import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, FlipHorizontal, LoaderCircle, CameraOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VisionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImageCaptured: (imageData: string, description: string) => void;
}

const VisionDialog = ({
  isOpen,
  onOpenChange,
  onImageCaptured
}: VisionDialogProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraError, setIsCameraError] = useState(false);
  const [description, setDescription] = useState('');
  const [isDescribing, setIsDescribing] = useState(false);
  
  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);
  
  const startCamera = async () => {
    setIsCameraError(false);
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraError(true);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
  };
  
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };
  
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the image data as a base64 string
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Get image description using AI
      setIsDescribing(true);
      try {
        if (typeof window !== 'undefined' && window.puter) {
          // Fixed: Using only 2 arguments as expected
          const response = await window.puter.ai.chat(`Describe what's in this image concisely.`, imageData);
          setDescription(response.message.content);
          
          // Provide the captured image and description back to the parent component
          onImageCaptured(imageData, response.message.content);
          onOpenChange(false);
        } else {
          // Mock for development environment
          setTimeout(() => {
            const mockDescription = "This appears to be a captured image. (Mock description)";
            setDescription(mockDescription);
            onImageCaptured(imageData, mockDescription);
            onOpenChange(false);
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to describe image:", error);
        toast({
          title: "Error",
          description: "Failed to describe the image. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsDescribing(false);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast({
        title: "Capture Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Vision</DialogTitle>
          <DialogDescription>
            Capture an image to get an AI description
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {isCameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <CameraOff className="w-12 h-12 mb-4" />
                <p>Camera access denied or unavailable.</p>
                <Button 
                  className="mt-4"
                  onClick={startCamera}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex mt-4 space-x-4">
            <Button
              onClick={toggleCamera}
              variant="outline"
              disabled={!isCameraReady || isCapturing || isDescribing}
            >
              <FlipHorizontal className="w-4 h-4 mr-2" />
              Flip Camera
            </Button>
            
            <Button
              onClick={captureImage}
              disabled={!isCameraReady || isCapturing || isDescribing}
            >
              {isCapturing || isDescribing ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  {isCapturing ? 'Capturing...' : 'Describing...'}
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Picture
                </>
              )}
            </Button>
          </div>
          
          {description && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded w-full">
              <p className="text-sm">{description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisionDialog;
