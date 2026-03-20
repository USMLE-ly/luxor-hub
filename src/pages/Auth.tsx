import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { trackEvent } from "@/lib/fbPixel";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!isLogin && !displayName.trim()) {
      newErrors.displayName = "Display name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);

    if (newErrors.displayName) nameRef.current?.focus();
    else if (newErrors.email) emailRef.current?.focus();
    else if (newErrors.password) passwordRef.current?.focus();

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (loading) return;

    if (!navigator.onLine) {
      toast.error("You appear to be offline. Please check your connection and try again.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to LEXOR®!");
        const { data: profile } = await supabase
          .from("style_profiles")
          .select("onboarding_completed")
          .eq("user_id", (await supabase.auth.getUser()).data.user!.id)
          .single();
        navigate(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        trackEvent("CompleteRegistration", { content_name: "LEXOR® Signup" });
        toast.success("Account created! Welcome to LEXOR®!");
        navigate("/onboarding");
      }
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (msg.includes("Invalid login credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in. Check your inbox.");
      } else if (msg.includes("User already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else {
        toast.error(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-dark/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div className="glass rounded-2xl p-8 gold-glow">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold gold-text mb-2">LEXOR®</h1>
            <p className="text-muted-foreground font-sans text-sm">
              {isLogin ? "Welcome back. Your style awaits." : "Begin your style journey."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Authentication form" noValidate>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-sans text-muted-foreground">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={nameRef}
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); setErrors((p) => ({ ...p, displayName: undefined })); }}
                    autoComplete="name"
                    aria-invalid={!!errors.displayName}
                    aria-describedby={errors.displayName ? "name-error" : undefined}
                    className="pl-10 bg-secondary border-glass-border focus:border-primary/50 rounded-xl h-12 font-sans"
                  />
                </div>
                {errors.displayName && (
                  <p id="name-error" role="alert" className="text-xs text-destructive font-sans mt-1">{errors.displayName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-sans text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="pl-10 bg-secondary border-glass-border focus:border-primary/50 rounded-xl h-12 font-sans"
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-destructive font-sans mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-sans text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={passwordRef}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="pl-10 bg-secondary border-glass-border focus:border-primary/50 rounded-xl h-12 font-sans"
                />
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-destructive font-sans mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-12 text-base hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans block mx-auto"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            {isLogin && (
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-sans block mx-auto"
              >
                Forgot your password?
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
