import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { GoldParticles } from "@/components/app/GoldParticles";
import { GoldDivider, PremiumCardWrapper, GoldShimmerButton } from "@/components/app/PremiumAuthCard";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(43,80%,42%)]/10 rounded-full blur-[100px]" />
      </div>
      <GoldParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </button>

        <PremiumCardWrapper>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[hsl(43,80%,58%,0.4)]" />
              <span className="text-[10px] tracking-[0.3em] text-[hsl(43,80%,58%,0.6)] font-sans uppercase">LEXOR®</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[hsl(43,80%,58%,0.4)]" />
            </div>
            <h1 className="font-display text-3xl font-bold gold-text">
              {success ? "All Set!" : "New Password"}
            </h1>
            <GoldDivider />
            <p className="text-muted-foreground font-sans text-sm">
              {success ? "Your password has been updated." : "Choose a new password for your account."}
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(43,80%,58%,0.15)] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-[hsl(43,80%,58%)]" />
              </div>
              <GoldShimmerButton>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-12 hover:shadow-[0_0_20px_hsl(43,80%,58%,0.3)] transition-all relative"
                >
                  Go to Dashboard
                </Button>
              </GoldShimmerButton>
            </div>
          ) : !isRecovery ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground font-sans">
                This link may have expired. Please request a new password reset.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/forgot-password")}
                className="border-[hsl(43,80%,58%,0.3)] hover:border-[hsl(43,80%,58%,0.5)] rounded-xl font-sans hover:shadow-[0_0_15px_hsl(43,80%,58%,0.15)]"
              >
                Request New Link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-sans text-muted-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm font-sans text-muted-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                  />
                </div>
              </div>

              <GoldShimmerButton>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-12 text-base hover:shadow-[0_0_20px_hsl(43,80%,58%,0.3)] transition-all relative"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </GoldShimmerButton>
            </form>
          )}
        </PremiumCardWrapper>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
