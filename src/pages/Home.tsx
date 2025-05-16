
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Camera, History, Scan } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleScanButtonClick = () => {
    navigate("/scan");
  };
  
  const handleHistoryButtonClick = () => {
    navigate("/history");
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center bg-white">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="container max-w-md mx-auto p-4 flex flex-col items-center">
        <div className="mt-8 mb-6 text-center">
          <h1 className="text-2xl font-bold text-vin-blue">Welcome, {user?.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground mt-2">
            Scan a vehicle's VIN to retrieve detailed information
          </p>
        </div>

        {/* Quick Actions */}
        <div className="w-full grid grid-cols-1 gap-4 mb-8">
          <Button 
            className="vin-gradient w-full h-14 rounded-full flex items-center justify-center text-lg font-medium"
            onClick={handleScanButtonClick}
          >
            <Camera className="mr-2 h-5 w-5" />
            Scan VIN
          </Button>
          
          <Button
            variant="outline" 
            className="w-full h-12 rounded-full flex items-center justify-center"
            onClick={handleHistoryButtonClick}
          >
            <History className="mr-2 h-5 w-5" />
            View Scan History
          </Button>
        </div>

        {/* Recent Scans Placeholder */}
        <div className="w-full mb-8 bg-card rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center">
            <Scan className="h-4 w-4 mr-2" />
            Recent Scans
          </h2>
          
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              No recent scans found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your scanned VINs will appear here
            </p>
          </div>
        </div>

        {/* Premium Features Placeholder */}
        <div className="mt-4 w-full p-4 bg-secondary/50 rounded-lg border border-dashed border-muted">
          <h3 className="font-medium text-center mb-2">Premium Features</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Factory build-sheet & options</li>
            <li>• Vehicle history</li>
            <li>• Location information</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
