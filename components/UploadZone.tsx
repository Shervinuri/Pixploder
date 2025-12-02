import React, { useCallback } from 'react';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) return;
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, isProcessing]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div 
      className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-8 mx-4 transition-all duration-300 border-2 border-dashed rounded-2xl bg-black/40 backdrop-blur-md border-neutral-700 hover:border-neutral-500 group"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="p-4 transition-transform duration-300 rounded-full bg-neutral-900 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-neutral-400 animate-spin" />
          ) : (
            <Upload className="w-10 h-10 text-neutral-400" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-neutral-200">
            {isProcessing ? 'Removing Background...' : 'Upload Image'}
          </h3>
          <p className="text-sm text-neutral-500">
            {isProcessing 
              ? 'AI is processing your image. This may take a moment.' 
              : 'Drag & drop or click to convert to particles'}
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleInputChange}
          disabled={isProcessing}
        />
        
        {!isProcessing && (
           <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors rounded-full text-neutral-400 bg-neutral-900 border border-neutral-800">
             <ImageIcon className="w-3 h-3" />
             <span>Supports PNG, JPG, WEBP</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
