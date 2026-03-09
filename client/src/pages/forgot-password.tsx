import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const { forgotPassword, isRequestingPasswordReset } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await forgotPassword(email);
      toast({ title: "Request submitted", description: result.message });
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unable to request reset",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your account email and we will send you a reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isRequestingPasswordReset}>
            {isRequestingPasswordReset ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
