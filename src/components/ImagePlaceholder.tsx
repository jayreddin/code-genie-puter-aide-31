
import React from 'react';

interface ImagePlaceholderProps {
  isLoading: boolean;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-4 mb-4 w-[300px] h-[350px]">
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Generating image...</p>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">Image will appear here</p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
