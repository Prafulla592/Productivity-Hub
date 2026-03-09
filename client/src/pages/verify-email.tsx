import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    verifyEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      })
      .catch((error: Error) => {
        setStatus("error");
        setMessage(error.message || "Unable to verify email.");
      });
  }, [verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center">
        {status === "loading" && <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />}
        {status === "success" && <CheckCircle2 className="h-10 w-10 mx-auto text-green-600" />}
        {status === "error" && <XCircle className="h-10 w-10 mx-auto text-destructive" />}

        <h1 className="mt-5 text-2xl font-bold">Email Verification</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>

        <div className="mt-6">
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
