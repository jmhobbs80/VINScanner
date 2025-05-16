
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTenant, checkInvitation, acceptInvitation } from "@/lib/supabase/queries";
import { useNavigate, useLocation } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  hasPremium: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshTenantInfo: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasPremium: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshTenantInfo: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't perform navigation when on AuthLoading page
  const isAuthLoadingPage = location.pathname === '/';
  
  // Helper function to handle navigation
  const handleNavigation = (isAuthenticated: boolean) => {
    if (isAuthLoadingPage) {
      // Let AuthLoading handle navigation when on the loading page
      return;
    }
    
    const restrictedPaths = ['/home', '/scan', '/history', '/settings'];
    const authPaths = ['/sign-in', '/sign-up', '/reset-password'];
    
    const currentPath = location.pathname;
    
    if (isAuthenticated) {
      // If user is authenticated and on an auth page, redirect to home
      if (authPaths.includes(currentPath)) {
        console.log("Authenticated user on auth page, redirecting to /home");
        navigate('/home', { replace: true });
      }
    } else {
      // If user is not authenticated and on a restricted page, redirect to sign-in
      if (restrictedPaths.includes(currentPath)) {
        console.log("Unauthenticated user on restricted page, redirecting to /sign-in");
        navigate('/sign-in', { replace: true });
      }
    }
  };

  // Helper function to fetch tenant information
  const fetchTenantInfo = async (tenantId: string | undefined) => {
    if (!tenantId) {
      console.log("No tenant ID provided, skipping tenant info fetch");
      return;
    }
    
    try {
      console.log(`Fetching tenant info for ID: ${tenantId}`);
      const tenantInfo = await getTenant(tenantId);
      
      if (tenantInfo) {
        setHasPremium(!!tenantInfo.has_premium);
        console.log(`Tenant premium status: ${!!tenantInfo.has_premium}`);
      } else {
        console.log("No tenant info found");
      }
    } catch (error) {
      console.error("Error fetching tenant info:", error);
    }
  };
  
  // Public function to manually refresh tenant info
  const refreshTenantInfo = async () => {
    if (user?.tenant_id) {
      await fetchTenantInfo(user.tenant_id);
    }
  };

  // Fetch tenant information when user is available
  useEffect(() => {
    if (user?.tenant_id) {
      fetchTenantInfo(user.tenant_id);
    }
  }, [user?.tenant_id]);

  // Check for invitation when user signs in or signs up
  const checkForInvitation = async (email: string, userId: string) => {
    try {
      const invitation = await checkInvitation(email);
      if (invitation) {
        console.log("Invitation found:", invitation);
        const success = await acceptInvitation(invitation.id, userId);
        if (success) {
          toast({
            title: "Invitation accepted",
            description: "You've been added to an organization.",
          });
          
          // Update user with organization info - Fix: Ensure role is of the correct type
          setUser(prev => prev ? {
            ...prev,
            tenant_id: invitation.organization_id,
            role: invitation.role as "owner" | "admin" | "user"
          } : null);
          
          // Refresh tenant info after accepting invitation
          setTimeout(() => {
            fetchTenantInfo(invitation.organization_id);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error checking for invitation:", error);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        
        if (!isMounted) return;
        
        if (session?.user) {
          console.log("Session found:", session.user.email);
          
          // Fix: Ensure role is of the correct type
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            role: "user" as "owner" | "admin" | "user", // Explicitly type as one of the allowed values
            tenant_id: session.user.id, // Using user ID as tenant_id for now
          };
          
          setUser(userData);
          
          // Check for invitation after setting initial user state
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session.user.email) {
            await checkForInvitation(session.user.email, session.user.id);
          }
          
          // Handle navigation - but only after initialization
          if (authInitialized) {
            handleNavigation(true);
          }
        } else {
          console.log("No session found");
          setUser(null);
          
          // Handle navigation - but only after initialization
          if (authInitialized) {
            handleNavigation(false);
          }
        }
        
        // Only set loading to false after we've processed the auth state
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking existing session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          console.log("Existing session found:", session.user.email);
          
          // Fix: Ensure role property is explicitly typed as one of the allowed values
          const userData: User = {
            id: session.user.id,
            email: session.user.email || "",
            role: "user" as "owner" | "admin" | "user", // Explicitly type as one of the allowed values
            tenant_id: session.user.id, // Default tenant_id, will be updated if needed
          };
          
          setUser(userData);
          
          // Check for invitation
          if (session.user.email) {
            await checkForInvitation(session.user.email, session.user.id);
          }
        }
        
        // Now we've initialized auth, enable navigation based on auth state
        setAuthInitialized(true);
        
        // Only perform navigation checks when not on the AuthLoading page
        if (!isAuthLoadingPage) {
          handleNavigation(!!session?.user);
        }
        
        // Set loading to false regardless of whether a session was found
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        if (isMounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };
    
    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, isAuthLoadingPage]);

  const handleSignIn = async (email: string, password: string) => {
    console.log("Sign in attempt with:", email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // User state will be updated by the onAuthStateChange listener
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      console.log("Sign in successful, user:", data.user?.email);
      
      // Don't set loading to false here - let the auth state change handler do it
    } catch (error: any) {
      console.error("Sign in exception:", error);
      toast({
        title: "Error signing in",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    console.log("Sign up attempt with:", email);
    setLoading(true);
    try {
      // Add emailRedirectTo option to make sure redirects work properly
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Skip email verification for now - this is a development setting
          emailRedirectTo: window.location.origin,
          data: {
            email: email,
          }
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      console.log("Sign up response:", data);

      // Check if the user is created but in a confirmationRequired state
      if (data?.user && !data.session) {
        setLoading(false);
        toast({
          title: "Sign up successful!",
          description: "Please check your email for a verification link to complete your registration.",
          duration: 10000, // Show this message longer
        });
        return;
      }

      // If we have a session, the user is automatically logged in
      if (data?.session) {
        toast({
          title: "Account created!",
          description: "You've been successfully signed in.",
        });
        
        // Check for invitation after successful signup
        if (data.user && data.user.email) {
          setTimeout(() => {
            checkForInvitation(data.user!.email!, data.user!.id);
          }, 0);
        }
      }
      
      console.log("Sign up completed, session:", !!data?.session);
      // Don't set loading to false here - let the auth state change handler do it
    } catch (error: any) {
      console.error("Sign up exception:", error);
      toast({
        title: "Error signing up",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // User state will be updated by the onAuthStateChange listener
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      // Don't set loading to false here - let the auth state change handler do it
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasPremium,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshTenantInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
