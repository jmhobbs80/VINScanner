
import { Button } from "@/components/ui/button";
import { Camera, X, Check, Pencil } from "lucide-react";
import { Loader } from "lucide-react";

interface ScanActionsProps {
  cameraActive: boolean;
  scanning: boolean;
  scanned: boolean;
  isLoading?: boolean;
  onStartScan: () => void;
  onStopScan: () => void;
  onSaveScan: () => void;
  onManualEntry: () => void;
  onCancel: () => void;
}

export default function ScanActions({
  cameraActive,
  scanning,
  scanned,
  isLoading = false,
  onStartScan,
  onStopScan,
  onSaveScan,
  onManualEntry,
  onCancel
}: ScanActionsProps) {
  return (
    <div className="w-full max-w-md mt-4">
      <div className="grid grid-cols-2 gap-4">
        {!scanned ? (
          <>
            <Button 
              className="bg-[#0066CC] hover:bg-[#0055AA] w-full h-12 rounded-lg flex items-center justify-center font-medium"
              onClick={cameraActive ? onStopScan : onStartScan}
              disabled={scanning || isLoading}
              data-testid="toggle-scan-button"
            >
              {cameraActive ? "Stop Scan" : scanning ? "Scanning..." : "Start Scan"}
            </Button>
            
            <Button
              variant="outline"
              className="border-2 text-gray-700 w-full h-12 rounded-lg flex items-center justify-center font-medium"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="cancel-button"
            >
              <X className="mr-2 h-5 w-5" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button 
              className="bg-[#00CC66] hover:bg-[#00AA55] w-full h-12 rounded-lg flex items-center justify-center font-medium"
              onClick={onSaveScan}
              disabled={isLoading}
              data-testid="save-scan-button"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Save Scan
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="border-2 text-gray-700 w-full h-12 rounded-lg flex items-center justify-center font-medium"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="cancel-scan-button"
            >
              <X className="mr-2 h-5 w-5" />
              Cancel
            </Button>
          </>
        )}
      </div>

      {!scanned && (
        <div className="text-center mt-4">
          <button 
            className="text-[#0066CC] text-sm underline"
            onClick={onManualEntry} 
            data-testid="manual-entry-link"
          >
            Enter VIN manually
          </button>
        </div>
      )}
    </div>
  );
}
