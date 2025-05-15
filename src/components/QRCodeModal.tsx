
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { QRCodeGenerator } from "@/components/ui/qrcode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Smartphone } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appStoreUrl?: string;
  googlePlayUrl?: string;
  title?: string;
  description?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  appStoreUrl = "https://apps.apple.com/app/puter-code-assistant",
  googlePlayUrl = "https://play.google.com/store/apps/details?id=com.puter.codeassistant",
  title = "Download Mobile App",
  description = "Scan the QR code to download our mobile app on iOS or Android"
}) => {
  const [liveSync, setLiveSync] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Generate a session ID for live sync when enabled
  const toggleLiveSync = (enabled: boolean) => {
    setLiveSync(enabled);
    if (enabled) {
      const newSessionId = Math.random().toString(36).substring(2, 10);
      setSessionId(newSessionId);
    } else {
      setSessionId('');
    }
  };

  // Get the current URL and add sync parameters if live sync is enabled
  const getSyncUrl = (baseUrl: string) => {
    if (liveSync && sessionId) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}sync=true&session=${sessionId}&platform=mobile`;
    }
    return `${baseUrl}?platform=mobile`;
  };

  // Current base URL of the web app
  const currentBaseUrl = typeof window !== 'undefined' ? 
    `${window.location.protocol}//${window.location.host}` : 
    'https://example.com';
  
  // Web app URL for direct access via QR code
  const webAppUrl = getSyncUrl(currentBaseUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" /> 
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Live Sync Toggle */}
          <div className="flex items-center space-x-2 w-full">
            <Switch
              id="live-sync"
              checked={liveSync}
              onCheckedChange={toggleLiveSync}
            />
            <Label htmlFor="live-sync">
              Enable Live Sync
              {liveSync && sessionId && (
                <span className="ml-2 text-xs text-blue-500">Session: {sessionId}</span>
              )}
            </Label>
          </div>
          
          {/* QR code for web app */}
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeGenerator 
                value={webAppUrl} 
                size={200} 
              />
            </div>
            <span className="text-sm text-center">
              Scan to {liveSync ? "sync with" : "open"} web app on mobile
            </span>
            {liveSync && (
              <span className="text-xs text-center text-blue-500">
                Changes made on either device will sync in real time
              </span>
            )}
          </div>
          
          <div className="w-full h-px bg-gray-200"></div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeGenerator 
                value={appStoreUrl} 
                size={200} 
              />
            </div>
            <span className="text-sm text-center">App Store (iOS)</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeGenerator 
                value={googlePlayUrl} 
                size={200} 
              />
            </div>
            <span className="text-sm text-center">Google Play Store (Android)</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
