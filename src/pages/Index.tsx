
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the auth loading page
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Logo className="mx-auto mb-4" />
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
