
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ManualEntryModal from "@/components/ManualEntryModal";
import CameraPreview from "@/components/scan/CameraPreview";
import ScanActions from "@/components/scan/ScanActions";
import { useScanVin } from "@/hooks/useScanVin";
import { isValidVIN } from "@/utils/vinValidator";

export default function ScanVIN() {
  const navigate = useNavigate();
  const { user, hasPremium } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const vinCache = new Map<string, any>();

  const {
    scanning,
    detectedText,
    cameraActive,
    scanned,
    location,
    showManualEntry,
    handleStartScan,
    handleStopScan,
    handleSaveScan,
    handleManualSubmit,
    detectVinFromFrame,
    setShowManualEntry
  } = useScanVin(user, hasPremium);

  const handleManualVinSubmit = async (vin: string) => {
    setError(null);
    setSuccessMessage(null);
    if (!isValidVIN(vin)) {
      setError("❌ Invalid VIN. Must be 17 characters and alphanumeric.");
      return;
    }

    if (vinCache.has(vin)) {
      setSuccessMessage("✅ VIN loaded from cache.");
      return;
    }

    try {
      setIsLoading(true);
      // Simulate a fetch or database operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      vinCache.set(vin, { vin });
      setSuccessMessage("✅ VIN scanned and saved successfully.");
    } catch (err) {
      setError("❌ Error saving VIN. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer mr-2" />
        <h1 className="text-xl font-bold">Scan VIN</h1>
      </div>

      {isLoading && <div className="text-blue-500 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {successMessage && <div className="text-green-600 mb-2">{successMessage}</div>}

      <CameraPreview canvasRef={canvasRef} active={cameraActive} />
      <ScanActions
        scanning={scanning}
        onStart={handleStartScan}
        onStop={handleStopScan}
        onManualEntry={() => setShowManualEntry(true)}
      />
      {showManualEntry && (
        <ManualEntryModal
          onClose={() => setShowManualEntry(false)}
          onSubmit={handleManualVinSubmit}
        />
      )}
    </div>
  );
}
