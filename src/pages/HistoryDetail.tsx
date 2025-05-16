
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, MapPin, Pencil } from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";
import { Json } from "@/integrations/supabase/types";

type ScanDetail = {
  id: string;
  vin: string;
  created_at: string;
  decoded_json: Json;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  premium_payload: Json | null;
};

export default function HistoryDetail() {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanDetail = async () => {
      if (!scanId) return;

      try {
        const { data, error } = await supabase
          .from('scans')
          .select('*')
          .eq('id', scanId)
          .single();

        if (error) {
          throw error;
        }

        setScan(data as ScanDetail);
      } catch (error) {
        console.error('Error fetching scan detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScanDetail();
  }, [scanId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Helper function to safely access Json properties
  const getJsonProperty = (json: Json | null, property: string): any => {
    if (json === null) return null;
    if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
      return (json as Record<string, any>)[property];
    }
    return null;
  };

  // Helper: safely walk a nested JSON path that may include numeric indexes
  const getNestedJsonProperty = (
    json: Json | null,
    path: (string | number)[]
  ): any => {
    if (json === null) return null;
    
    let current: any = json;
    
    for (const key of path) {
      if (typeof current !== 'object' || current === null || Array.isArray(current)) {
        return null;
      }
      
      // Cast numeric or string key to string to satisfy Record<string, any>
      current = (current as Record<string, any>)[String(key)];
      
      if (current === undefined) {
        return null;
      }
    }
    
    return current;
  };

  // Check if scan was manually entered
  const isManualEntry = (): boolean => {
    return scan?.photo_url === 'manual-entry.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-muted-foreground">Scan not found</p>
        <Button className="mt-4" onClick={() => navigate('/history')}>
          Back to History
        </Button>
      </div>
    );
  }

  // Helper function to safely get properties from JSON
  const getDecodedProperty = (key: string) => {
    return getJsonProperty(scan.decoded_json, key) || 'Unknown';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/history")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold ml-2">Scan Detail</h1>
        </div>
        
        {scan.premium_payload && (
          <PremiumBadge />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6">
        {/* VIN Photo */}
        {scan.photo_url && !isManualEntry() ? (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={scan.photo_url} 
              alt="VIN" 
              className="w-full h-full object-contain" 
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {isManualEntry() ? (
              <div className="text-center">
                <Pencil className="h-16 w-16 text-blue-400 opacity-30 mx-auto mb-2" />
                <p className="text-muted-foreground">Manually entered VIN</p>
              </div>
            ) : (
              <div className="text-center">
                <Car className="h-16 w-16 text-muted-foreground opacity-30 mx-auto mb-2" />
                <p className="text-muted-foreground">No photo available</p>
              </div>
            )}
          </div>
        )}

        {/* Vehicle Info */}
        <div className="border rounded-lg p-4">
          <h2 className="font-medium mb-2 flex items-center">
            Vehicle Information
            {isManualEntry() && <Pencil className="h-4 w-4 ml-2 text-blue-500" />}
          </h2>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-4">{scan.vin}</p>
          
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Make:</p>
              <p>{getDecodedProperty('make')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Model:</p>
              <p>{getDecodedProperty('model')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Year:</p>
              <p>{getDecodedProperty('year')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Trim:</p>
              <p>{getDecodedProperty('trim')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Scan Date:</p>
              <p>{formatDate(scan.created_at)}</p>
            </div>
            {isManualEntry() && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Entry Method:</p>
                <p className="flex items-center">
                  Manual <Pencil className="h-3 w-3 ml-1 text-blue-500" />
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        {(scan.latitude && scan.longitude) && (
          <div className="border rounded-lg p-4">
            <h2 className="font-medium mb-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Location
            </h2>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {scan.latitude.toFixed(6)}, {scan.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {/* Convert to string in case the place_name is a number */}
                  {String(getNestedJsonProperty(scan.premium_payload, ['locationInfo', 'data', 'features', 0, 'place_name']) || 
                   'Map view not available')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Data */}
        {scan.premium_payload && (
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium">Premium Data</h2>
              <PremiumBadge className="scale-75" />
            </div>
            
            <div className="space-y-4">
              {getJsonProperty(scan.premium_payload, 'buildSheet') && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Build Sheet</h3>
                  <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(getJsonProperty(scan.premium_payload, 'buildSheet'), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {getJsonProperty(scan.premium_payload, 'vehicleHistory') && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Vehicle History</h3>
                  <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(getJsonProperty(scan.premium_payload, 'vehicleHistory'), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
