
import React from 'react';
import HomeScreen from './screens/HomeScreen';

// Simplified mobile app entry point that doesn't try to use React Navigation
const MobileApp = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Puter Code Assistant Mobile</h1>
      <HomeScreen />
    </div>
  );
};

export default MobileApp;
