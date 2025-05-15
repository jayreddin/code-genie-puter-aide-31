
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal = ({ isOpen, onClose }: QRCodeModalProps) => {
  // A working QR code that points to a website (you can replace with your actual app URL)
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://puter.com/app/code-assistant";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Mobile App</DialogTitle>
          <DialogDescription>
            Scan this QR code to download the Puter Code Assistant mobile app
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6">
          <img 
            src={qrCodeUrl} 
            alt="QR Code to download the app" 
            className="mb-4 w-[200px] h-[200px]"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <svg className="mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <p className="text-sm mt-1">iOS</p>
            </div>
            
            <div className="text-center">
              <svg className="mx-auto" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.94c-.44 0-.86-.18-1.18-.5-.32-.32-.5-.74-.5-1.18V1.74c0-.44.18-.86.5-1.18.32-.32.74-.5 1.18-.5h17.64c.44 0 .86.18 1.18.5.32.32.5.74.5 1.18v20.52c0 .44-.18.86-.5 1.18-.32.32-.74.5-1.18.5H3.18zM12 7.74l-6.2-3.56v-.01l6.2-3.56 6.27 3.56-6.27 3.57zm4.76 6.05-4.76-2.73-4.76 2.73v-5.5L12 10.54l4.76 2.75v.5z" />
              </svg>
              <p className="text-sm mt-1">Android</p>
            </div>
          </div>

          <div className="text-center mt-4 text-sm text-gray-500">
            <p>To add this to your EPO account app:</p>
            <ol className="list-decimal text-left mt-2 pl-4">
              <li>Log in to your EPO account</li>
              <li>Navigate to "App Settings"</li>
              <li>Select "Add External App"</li>
              <li>Enter the app URL or scan this QR code</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
