import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, User, Sun, Moon, Palette } from "lucide-react";
import { NotificationPreferences } from "@/components/app/NotificationPreferences";
import { useTheme } from "next-themes";
import { haptic } from "@/lib/haptics";

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.display_name) setDisplayName(data.display_name);
    });
  }, [user]);

  const toggleTheme = (dark: boolean) => {
    haptic("medium");
    setTheme(dark ? "dark" : "light");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
    setSaving(false);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1 mb-8">Manage your account</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile
          </h3>
          <div className="space-y-4">
            <div>
              <Label className="font-sans text-sm text-muted-foreground">Email</Label>
              <Input value={user?.email || ""} disabled className="bg-secondary border-glass-border mt-1 opacity-60" />
            </div>
            <div>
              <Label className="font-sans text-sm text-muted-foreground">Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-glass-border mt-1" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gold-gradient text-primary-foreground font-sans">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Theme Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" /> Appearance
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <div>
                  <p className="text-sm font-sans text-foreground">{isDark ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground font-sans">
                    {isDark ? "Easy on the eyes, always stylish" : "Bright and airy aesthetic"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <NotificationPreferences />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Settings;
