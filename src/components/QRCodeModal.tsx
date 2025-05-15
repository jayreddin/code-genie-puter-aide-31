
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { QRCodeGenerator } from "@/components/ui/qrcode";
import { Button } from "@/components/ui/button";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-4">
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
