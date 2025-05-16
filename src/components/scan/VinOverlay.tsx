
import { useRef, useEffect } from "react";

interface VinOverlayProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  visible: boolean;
}

export default function VinOverlay({ canvasRef, visible }: VinOverlayProps) {
  useEffect(() => {
    if (visible && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Draw detection overlay
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate rectangle dimensions (approximately 80% width, 30% height)
        const rectWidth = canvasWidth * 0.8;
        const rectHeight = canvasHeight * 0.3;
        const rectX = (canvasWidth - rectWidth) / 2;
        const rectY = (canvasHeight - rectHeight) / 2;
        
        // Clear canvas first
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Semi-transparent overlay
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Clear the center rectangle to create a "window" effect
        context.clearRect(rectX, rectY, rectWidth, rectHeight);
        
        // Draw a white border around the rectangle
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        context.lineWidth = 2;
        context.strokeRect(rectX, rectY, rectWidth, rectHeight);
        
        // Add helper text
        context.fillStyle = 'white';
        context.font = '16px sans-serif';
        context.textAlign = 'center';
        context.fillText('ALIGN VIN', canvasWidth / 2, rectY - 10);
        context.fillText('HERE', canvasWidth / 2, rectY + rectHeight + 25);
      }
    }
  }, [visible, canvasRef]);

  return null; // This is a logical component that modifies the passed canvas
}
