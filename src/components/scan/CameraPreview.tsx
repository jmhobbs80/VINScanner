
import { useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import VinOverlay from "./VinOverlay";

interface CameraPreviewProps {
  cameraActive: boolean;
  onFrame: (videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) => void;
  scanned: boolean;
  detectedText: string;
}

export default function CameraPreview({ 
  cameraActive, 
  onFrame, 
  scanned, 
  detectedText 
}: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle starting the camera when cameraActive changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [cameraActive]);
  
  // Process frames for VIN detection
  useEffect(() => {
    if (cameraActive && !scanned) {
      const timer = setInterval(() => {
        onFrame(videoRef, canvasRef);
      }, 500); // Check for VIN more frequently
      
      return () => clearInterval(timer);
    }
  }, [cameraActive, scanned, onFrame]);
  
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="w-full max-w-md aspect-[16/9] bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
      {cameraActive ? (
        <>
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover" 
            autoPlay 
            playsInline 
            muted
            data-testid="camera-video"
          />
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="camera-canvas" 
          />
          
          {/* VIN Alignment Overlay */}
          <VinOverlay canvasRef={canvasRef} visible={cameraActive && !scanned} />
          
          {scanned && (
            <div className="absolute bottom-4 left-4 right-4 bg-green-500/80 p-2 rounded-md" data-testid="vin-detected">
              <p className="text-white text-center text-sm font-medium">
                VIN Detected: {detectedText}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-white text-center" data-testid="camera-placeholder">
          <div className="flex flex-col items-center">
            <Camera className="h-12 w-12 mb-2 text-gray-400" />
            <p>Press Start Scan to activate camera</p>
          </div>
        </div>
      )}
    </div>
  );
}
