
import { Camera, History, Home, LogOut, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/home",
    },
    {
      label: "Scan",
      icon: Camera,
      path: "/scan",
    },
    {
      label: "History",
      icon: History,
      path: "/history",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    }
  ];

  const isActive = (path: string) => {
    if (path === "/history" && location.pathname.startsWith("/history/")) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-4 w-full",
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
        <button
          className="flex flex-col items-center justify-center py-2 px-4 w-full text-muted-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
}
