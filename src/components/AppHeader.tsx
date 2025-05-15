import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChromeExtensionModal from './ChromeExtensionModal';
import QRCodeModal from './QRCodeModal';
const AppHeader: React.FC = () => {
  const [isChromeModalOpen, setChromeModalOpen] = useState(false);
  const [isQRModalOpen, setQRModalOpen] = useState(false);
  const location = useLocation();
  const handleOpenChromeModal = () => {
    setChromeModalOpen(true);
  };
  const handleOpenQRModal = () => {
    setQRModalOpen(true);
  };
  return <header className="container mx-auto px-6 flex justify-between items-center py-[5px]">
      <div className="flex items-center">
        <Link to="/">
          <span className="text-2xl font-bold text-blue-400">Puter</span>
          <span className="text-2xl font-bold ml-1">Code Assistant</span>
        </Link>
      </div>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link to="/#features" className={`${location.hash === '#features' ? 'text-blue-400' : ''} hover:text-blue-400 transition-colors`}>
              Features
            </Link>
          </li>
          <li>
            <button onClick={handleOpenChromeModal} className={`${location.hash === '#chrome-extension' ? 'text-blue-400' : ''} hover:text-blue-400 transition-colors`}>
              Chrome Extension
            </button>
          </li>
          <li>
            <button onClick={handleOpenQRModal} className={`${location.hash === '#mobile-app' ? 'text-blue-400' : ''} hover:text-blue-400 transition-colors`}>
              Mobile App
            </button>
          </li>
          <li>
            <Link to="/chat" className={`${location.pathname === '/chat' ? 'text-blue-400' : ''} hover:text-blue-400 transition-colors`}>
              Chat
            </Link>
          </li>
        </ul>
      </nav>
      
      <ChromeExtensionModal isOpen={isChromeModalOpen} onClose={() => setChromeModalOpen(false)} />
      
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setQRModalOpen(false)} title="Mobile App" description="Scan the QR code to use our mobile app" />
    </header>;
};
export default AppHeader;