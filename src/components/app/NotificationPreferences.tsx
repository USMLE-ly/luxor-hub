import { useState, useEffect } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM
  weatherBased: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "08:00",
  weatherBased: true,
};

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("aurelia_notif_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem("aurelia_notif_settings", JSON.stringify(newSettings));
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications not supported in this browser");
      return;
    }
    const permission = await Notification.requestPermission();
    setPermissionState(permission);
    if (permission === "granted") {
      saveSettings({ ...settings, enabled: true });
      // Schedule a test notification
      new Notification("AURELIA 🌟", {
        body: "Daily outfit notifications enabled! You'll get style suggestions each morning.",
        icon: "/favicon.ico",
      });
      toast.success("Notifications enabled!");
      scheduleNotifications({ ...settings, enabled: true });
    } else {
      toast.error("Notification permission denied");
    }
  };

  const toggleNotifications = (enabled: boolean) => {
    if (enabled && permissionState !== "granted") {
      requestPermission();
      return;
    }
    saveSettings({ ...settings, enabled });
    if (enabled) {
      scheduleNotifications({ ...settings, enabled });
    }
  };

  const scheduleNotifications = (s: NotificationSettings) => {
    // Clear any existing scheduled notifications
    if ((window as any).__aureliaNotifInterval) {
      clearInterval((window as any).__aureliaNotifInterval);
    }
    if (!s.enabled) return;

    // Check every minute if it's time to notify
    (window as any).__aureliaNotifInterval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const lastNotif = localStorage.getItem("aurelia_last_notif_date");
      const today = now.toISOString().split("T")[0];

      if (currentTime === s.time && lastNotif !== today) {
        localStorage.setItem("aurelia_last_notif_date", today);
        sendDailyOutfitNotification(s.weatherBased);
      }
    }, 60000);
  };

  useEffect(() => {
    if (settings.enabled && permissionState === "granted") {
      scheduleNotifications(settings);
    }
    return () => {
      if ((window as any).__aureliaNotifInterval) {
        clearInterval((window as any).__aureliaNotifInterval);
      }
    };
  }, []);

  const sendDailyOutfitNotification = async (includeWeather: boolean) => {
    const tips = [
      "Layer up today — a blazer over a tee keeps it sharp.",
      "Try mixing textures today: denim + knit is always a win.",
      "Earth tones are trending this season. Pull that olive piece!",
      "Keep it minimal today. Less is more.",
      "It's a great day for that statement piece you haven't worn yet.",
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];

    let body = `Today's style tip: ${tip}`;
    if (includeWeather) {
      body += "\n\nOpen AURELIA for weather-matched outfit suggestions.";
    }

    new Notification("AURELIA — Your Daily Outfit", {
      body,
      icon: "/favicon.ico",
      tag: "daily-outfit",
    });
  };

  const times = ["06:00", "07:00", "07:30", "08:00", "08:30", "09:00", "10:00"];

  return (
    <div className="glass rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.enabled ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Daily Outfit Notifications</h3>
            <p className="text-muted-foreground font-sans text-xs">Get morning outfit suggestions</p>
          </div>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={toggleNotifications}
        />
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-2 border-t border-glass-border">
          <div className="flex items-center justify-between">
            <Label className="font-sans text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Notification time
            </Label>
            <Select value={settings.time} onValueChange={(v) => saveSettings({ ...settings, time: v })}>
              <SelectTrigger className="w-28 bg-secondary border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {times.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="font-sans text-sm text-muted-foreground">Include weather context</Label>
            <Switch
              checked={settings.weatherBased}
              onCheckedChange={(v) => saveSettings({ ...settings, weatherBased: v })}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => sendDailyOutfitNotification(settings.weatherBased)}
            className="w-full border-glass-border font-sans text-sm"
          >
            Send Test Notification
          </Button>
        </div>
      )}
    </div>
  );
}
