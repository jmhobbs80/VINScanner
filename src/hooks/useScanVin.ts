
import { useState, useEffect } from "react";
import * as Location from 'expo-location';
import { toast } from "@/hooks/use-toast";
import { uploadVinPhoto, saveVinScan } from "@/lib/supabase";
import { decodeVin } from "@/services/vehicleData";
import { getBuildSheet, getVehicleHistory, reverseGeocode } from "@/services/premium";
import { User } from "@/types";
import { isValidVIN } from "@/utils/vinValidator";

const vinCache = new Map<string, any>();

export function useScanVin(user: User | null, hasPremium: boolean) {
  const [scanning, setScanning] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    })();
  }, []);

  const handleSaveScan = async (vin: string) => {
    setError(null);
    setSuccessMessage(null);

    if (!isValidVIN(vin)) {
      setError("❌ Invalid VIN format.");
      return;
    }

    if (vinCache.has(vin)) {
      setSuccessMessage("✅ VIN found in cache.");
      return;
    }

    try {
      setLoading(true);
      const vehicleInfo = await decodeVin(vin);
      vinCache.set(vin, vehicleInfo);
      setDetectedText(vin);
      setSuccessMessage("✅ VIN decoded and saved.");
      setScanned(true);
    } catch (err: any) {
      console.error("VIN decode failed:", err);
      setError("❌ VIN decoding failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    scanning,
    detectedText,
    cameraActive,
    scanned,
    location,
    showManualEntry,
    handleStartScan: () => setCameraActive(true),
    handleStopScan: () => setCameraActive(false),
    handleSaveScan,
    handleManualSubmit: handleSaveScan,
    detectVinFromFrame: (vin: string) => {
      if (isValidVIN(vin)) {
        handleSaveScan(vin);
      }
    },
    setShowManualEntry,
    loading,
    error,
    successMessage
  };
}
