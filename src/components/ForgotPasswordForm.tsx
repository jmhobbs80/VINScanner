
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  onCancel: () => void;
}

export function ForgotPasswordForm({ onCancel }: ForgotPasswordFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Error sending reset email",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setSent(true);
      toast({
        title: "Recovery email sent",
        description: "Please check your inbox for password reset instructions",
      });
    } catch (error: any) {
      toast({
        title: "Error sending reset email",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm">
          We've sent recovery instructions to your email address. 
          Please check your inbox.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onCancel}
        >
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="your@email.com"
          disabled={submitting}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Button
          type="submit"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send Recovery Email"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
}
