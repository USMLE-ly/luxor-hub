import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationSettings {
  morningEnabled: boolean;
  morningTime: string;
  eveningEnabled: boolean;
  eveningTime: string;
  weatherBased: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  morningEnabled: false,
  morningTime: "08:00",
  eveningEnabled: false,
  eveningTime: "21:00",
  weatherBased: true,
};

const morningTips = [
  "Layer up today — a blazer over a tee keeps it sharp.",
  "Try mixing textures today: denim + knit is always a win.",
  "Earth tones are trending this season. Pull that olive piece!",
  "Keep it minimal today. Less is more.",
  "It's a great day for that statement piece you haven't worn yet.",
];

const eveningPrompts = [
  "How did today's outfit feel? Rate it to help the AI learn your preferences.",
  "Time for your evening reflection — did you get any compliments today?",
  "Quick check-in: was today's outfit comfortable for everything you did?",
  "Before bed, tell LEXOR® how your style went today. 30 seconds = smarter outfits.",
  "Evening reflection time ✨ Your feedback makes tomorrow's outfit even better.",
];

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("luxor_notif_settings_v2");
    if (saved) return JSON.parse(saved);
    // Migrate from v1
    const v1 = localStorage.getItem("luxor_notif_settings");
    if (v1) {
      const old = JSON.parse(v1);
      return {
        morningEnabled: old.enabled || false,
        morningTime: old.time || "08:00",
        eveningEnabled: false,
        eveningTime: "21:00",
        weatherBased: old.weatherBased ?? true,
      };
    }
    return DEFAULT_SETTINGS;
  });
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("luxor_notif_settings_v2", JSON.stringify(newSettings));
  };

  const anyEnabled = settings.morningEnabled || settings.eveningEnabled;

  const requestPermission = async (callback: () => void) => {
    if (!("Notification" in window)) {
      toast.error("Notifications not supported in this browser");
      return;
    }
    const permission = await Notification.requestPermission();
    setPermissionState(permission);
    if (permission === "granted") {
      callback();
      toast.success("Notifications enabled!");
    } else {
      toast.error("Notification permission denied");
    }
  };

  const toggleMorning = (enabled: boolean) => {
    if (enabled && permissionState !== "granted") {
      requestPermission(() => saveSettings({ ...settings, morningEnabled: true }));
      return;
    }
    saveSettings({ ...settings, morningEnabled: enabled });
  };

  const toggleEvening = (enabled: boolean) => {
    if (enabled && permissionState !== "granted") {
      requestPermission(() => saveSettings({ ...settings, eveningEnabled: true }));
      return;
    }
    saveSettings({ ...settings, eveningEnabled: enabled });
  };

  // Schedule checker
  useEffect(() => {
    if ((window as any).__luxorNotifInterval) {
      clearInterval((window as any).__luxorNotifInterval);
    }
    if (!anyEnabled || permissionState !== "granted") return;

    (window as any).__luxorNotifInterval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const today = now.toISOString().split("T")[0];

      if (settings.morningEnabled && currentTime === settings.morningTime) {
        const key = `luxor_morning_notif_${today}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          sendMorningNotification();
        }
      }

      if (settings.eveningEnabled && currentTime === settings.eveningTime) {
        const key = `luxor_evening_notif_${today}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          sendEveningNotification();
        }
      }
    }, 60000);

    return () => {
      if ((window as any).__luxorNotifInterval) {
        clearInterval((window as any).__luxorNotifInterval);
      }
    };
  }, [settings, permissionState]);

  const sendMorningNotification = () => {
    const tip = morningTips[Math.floor(Math.random() * morningTips.length)];
    let body = `☀️ ${tip}`;
    if (settings.weatherBased) {
      body += "\nOpen LEXOR® for weather-matched outfit suggestions.";
    }
    new Notification("LEXOR® — Good Morning! 👗", {
      body,
      icon: "/favicon.ico",
      tag: "morning-outfit",
    });
  };

  const sendEveningNotification = () => {
    const prompt = eveningPrompts[Math.floor(Math.random() * eveningPrompts.length)];
    new Notification("LEXOR® — Evening Reflection 🌙", {
      body: prompt,
      icon: "/favicon.ico",
      tag: "evening-reflection",
    });
  };

  const morningTimes = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "10:00"];
  const eveningTimes = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

  return (
    <div className="glass rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3 mb-1">
        {anyEnabled ? (
          <Bell className="h-5 w-5 text-primary" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">Smart Reminders</h3>
          <p className="text-muted-foreground font-sans text-xs">Morning outfit & evening reflection</p>
        </div>
      </div>

      {/* Morning Reminder */}
      <div className="space-y-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <Label className="font-sans text-sm text-foreground flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-400" /> Morning Outfit Reminder
          </Label>
          <Switch checked={settings.morningEnabled} onCheckedChange={toggleMorning} />
        </div>
        {settings.morningEnabled && (
          <div className="flex items-center justify-between pl-6">
            <Label className="font-sans text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Time
            </Label>
            <Select value={settings.morningTime} onValueChange={(v) => saveSettings({ ...settings, morningTime: v })}>
              <SelectTrigger className="w-24 h-8 bg-secondary border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {morningTimes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Evening Reminder */}
      <div className="space-y-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <Label className="font-sans text-sm text-foreground flex items-center gap-2">
            <Moon className="h-4 w-4 text-blue-400" /> Evening Reflection Reminder
          </Label>
          <Switch checked={settings.eveningEnabled} onCheckedChange={toggleEvening} />
        </div>
        {settings.eveningEnabled && (
          <div className="flex items-center justify-between pl-6">
            <Label className="font-sans text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Time
            </Label>
            <Select value={settings.eveningTime} onValueChange={(v) => saveSettings({ ...settings, eveningTime: v })}>
              <SelectTrigger className="w-24 h-8 bg-secondary border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eveningTimes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Weather toggle */}
      {settings.morningEnabled && (
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Label className="font-sans text-sm text-muted-foreground">Include weather in morning tip</Label>
          <Switch
            checked={settings.weatherBased}
            onCheckedChange={(v) => saveSettings({ ...settings, weatherBased: v })}
          />
        </div>
      )}

      {/* Test buttons */}
      {anyEnabled && permissionState === "granted" && (
        <div className="flex gap-2 pt-3 border-t border-border/50">
          {settings.morningEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={sendMorningNotification}
              className="flex-1 border-border font-sans text-xs"
            >
              <Sun className="h-3.5 w-3.5 mr-1.5" /> Test Morning
            </Button>
          )}
          {settings.eveningEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={sendEveningNotification}
              className="flex-1 border-border font-sans text-xs"
            >
              <Moon className="h-3.5 w-3.5 mr-1.5" /> Test Evening
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
