
import { Link } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col justify-center p-4 sm:p-6 lg:p-8 bg-muted/30">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-md border">
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Join today to access all features
          </p>
          
          <AuthForm type="sign-up" />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sign-in" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By signing up, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
