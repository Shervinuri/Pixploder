import React, { useState } from 'react';
import { X, RefreshCcw, Download } from 'lucide-react';
import UploadZone from './components/UploadZone';
import ParticleCanvas from './components/ParticleCanvas';
import Footer from './components/Footer';
import { processImageBackground } from './utils/imageUtils';
import { AppState } from './types';
import { blobUrlToBase64, generateStandaloneHTML } from './utils/exportUtils';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleFileSelect = async (file: File) => {
    setAppState(AppState.PROCESSING);
    try {
      // Step 1: Remove Background
      const processedImageUrl = await processImageBackground(file);
      setProcessedImage(processedImageUrl);
      setAppState(AppState.READY);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      // Reset after error
      setTimeout(() => setAppState(AppState.IDLE), 3000);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setProcessedImage(null);
  };

  const handleDownload = async () => {
    if (!processedImage) return;
    setIsExporting(true);

    try {
      // 1. Convert Blob URL to Base64 to embed in HTML
      const base64Data = await blobUrlToBase64(processedImage);
      
      // 2. Generate the HTML content
      const htmlContent = generateStandaloneHTML(base64Data);
      
      // 3. Create a download link and trigger it
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shen-particle-art.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-screen overflow-hidden bg-black font-sans text-white">
      
      {/* Background Gradients for Aesthetics */}
      <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        
        {appState === AppState.IDLE && (
          <UploadZone 
            onFileSelect={handleFileSelect} 
            isProcessing={false} 
          />
        )}

        {appState === AppState.PROCESSING && (
          <UploadZone 
            onFileSelect={() => {}} 
            isProcessing={true} 
          />
        )}

        {appState === AppState.READY && processedImage && (
          <>
            <ParticleCanvas imageSrc={processedImage} />
            
            {/* Control Panel */}
            <div className="absolute top-6 right-6 z-50 flex gap-2">
               
               {/* Download Button */}
               <button 
                onClick={handleDownload}
                disabled={isExporting}
                className="group flex items-center justify-center p-3 rounded-full bg-black/50 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
                title="Download Standalone HTML"
              >
                <Download className={`w-5 h-5 text-white/70 group-hover:text-white transition-colors ${isExporting ? 'animate-bounce' : ''}`} />
              </button>

               {/* Reset Button */}
               <button 
                onClick={handleReset}
                className="group flex items-center justify-center p-3 rounded-full bg-black/50 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                title="Upload New Image"
              >
                <RefreshCcw className="w-5 h-5 text-white/70 group-hover:text-white transition-colors group-hover:rotate-180 transition-transform duration-700" />
              </button>
            </div>
          </>
        )}

        {appState === AppState.ERROR && (
           <div className="p-6 text-center border rounded-xl bg-red-900/20 border-red-500/50 backdrop-blur-md animate-in fade-in zoom-in duration-300">
              <X className="w-12 h-12 mx-auto mb-2 text-red-500" />
              <h2 className="text-lg font-bold text-red-200">Processing Failed</h2>
              <p className="text-sm text-red-300">Could not process image. Try another one.</p>
           </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default App;
