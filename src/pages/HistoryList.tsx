
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import PremiumBadge from "@/components/PremiumBadge";
import { Json } from "@/integrations/supabase/types";

type ScanItem = {
  id: string;
  vin: string;
  created_at: string;
  decoded_json: Json;
  premium_payload: Json | null;
  photo_url: string | null;
};

export default function HistoryList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      if (!user?.tenant_id) return;

      try {
        const { data, error } = await supabase
          .from('scans')
          .select('*')
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setScans(data || []);
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [user?.tenant_id]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Helper function to safely get property from Json object
  const getJsonProperty = (json: Json | null, property: string): string => {
    if (json === null) return '';
    if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
      return (json as Record<string, any>)[property] || '';
    }
    return '';
  };

  // Check if scan was manually entered
  const isManualEntry = (scan: ScanItem): boolean => {
    return scan.photo_url === 'manual-entry.png';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16">
      {/* Header */}
      <header className="border-b p-4 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/home")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold ml-2">Scan History</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No scan history found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your scanned VINs will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan.id}
                className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                onClick={() => navigate(`/history/${scan.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-muted-foreground flex items-center">
                      {scan.vin}
                      {isManualEntry(scan) && (
                        <Pencil className="h-3 w-3 ml-1 text-blue-500" />
                      )}
                    </p>
                    <h3 className="font-medium mt-1">
                      {`${getJsonProperty(scan.decoded_json, 'make')} ${getJsonProperty(scan.decoded_json, 'model')} ${getJsonProperty(scan.decoded_json, 'year')}`}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(scan.created_at)}
                    </p>
                  </div>
                  {scan.premium_payload && (
                    <PremiumBadge />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
