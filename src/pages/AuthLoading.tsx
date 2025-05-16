
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export default function AuthLoading() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    console.log("AuthLoading navigation check - loading:", loading, "user:", !!user);
    
    // Prevent navigation if already in progress or still loading
    if (isNavigating || loading) {
      return;
    }
    
    const timer = setTimeout(() => {
      if (!loading) {
        setIsNavigating(true);
        if (user) {
          console.log("AuthLoading: Navigating to /home");
          navigate("/home", { replace: true });
        } else {
          console.log("AuthLoading: Navigating to /sign-in");
          navigate("/sign-in", { replace: true });
        }
      }
    }, 500); // Increased delay to ensure auth state is properly initialized
    
    return () => clearTimeout(timer);
  }, [user, loading, navigate, isNavigating]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center">
        <Logo className="mb-8 text-vin-blue" />
        
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
        
        <p className="mt-4 text-muted-foreground">Loading your account...</p>
      </div>
    </div>
  );
}
