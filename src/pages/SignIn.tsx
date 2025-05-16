
import { Link } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SignIn() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col justify-center p-4 sm:p-6 lg:p-8 bg-muted/30">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md border">
          <h1 className="text-2xl font-bold text-center mb-2">
            {showForgotPassword ? "Reset Password" : "Welcome Back"}
          </h1>
          
          {!showForgotPassword && (
            <Alert variant="default" className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Use the email and password you signed up with to log in.
              </AlertDescription>
            </Alert>
          )}
          
          {showForgotPassword ? (
            <ForgotPasswordForm onCancel={() => setShowForgotPassword(false)} />
          ) : (
            <>
              <AuthForm type="sign-in" />
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/sign-up" className="text-primary font-medium hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
