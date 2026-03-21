import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";
import { GoldParticles } from "@/components/app/GoldParticles";
import { GoldDivider, PremiumCardWrapper, GoldShimmerButton } from "@/components/app/PremiumAuthCard";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link!");
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
            <h1 className="font-display text-3xl font-bold gold-text">Reset Password</h1>
            <GoldDivider />
            <p className="text-muted-foreground font-sans text-sm">
              {sent ? "We've sent you a reset link." : "Enter your email to receive a reset link."}
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[hsl(43,80%,58%,0.15)] flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-[hsl(43,80%,58%)]" />
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Check your inbox for <span className="text-foreground">{email}</span> and click the link to reset your password.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-[hsl(43,80%,58%,0.3)] hover:border-[hsl(43,80%,58%,0.5)] rounded-xl font-sans hover:shadow-[0_0_15px_hsl(43,80%,58%,0.15)]"
              >
                Return to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-sans text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    "Send Reset Link"
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

export default ForgotPassword;
