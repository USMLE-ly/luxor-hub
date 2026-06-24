import { r as reactExports, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { A as AppLayout } from "./AppLayout-DQMjD52q.js";
import { d as createLucideIcon, u as useComposedRefs, c as cn, B as Button, e as useAuth, j, s as supabase, h as haptic } from "./AppContent-4cFLEqQ4.js";
import { I as Input } from "./input-BLBpTUfT.js";
import { L as Label } from "./label-BI9Vm6gS.js";
import { c as composeEventHandlers, u as useControllableState } from "./index-ZAaTSPdI.js";
import { c as createContextScope } from "./index-ZUFtIYVr.js";
import { u as usePrevious, S as Select, a as SelectTrigger, b as SelectValue, d as SelectContent, e as SelectItem } from "./select-C27XPZAd.js";
import { u as useSize } from "./index-BhDyFgBT.js";
import { P as Primitive } from "./index-DoiO9BYn.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { B as Bell } from "./bell-sZpifRYE.js";
import { B as BellOff } from "./bell-off-CVIQHFT9.js";
import { S as Sun } from "./sun-BcvA6-_-.js";
import { C as Clock } from "./clock-hA_RhJJG.js";
import { M as Moon } from "./moon-RkC-1p6N.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { U as User } from "./user-5K2EfAuQ.js";
import { S as Save } from "./save-E_0V-D_q.js";
import { P as Palette } from "./palette-B4Mc31R8.js";
import "./BottomNav-TzXkY_hr.js";
import "./shirt-GoHrHLkp.js";
import "./index-CWYjAC1K.js";
import "./index-BdIuB2-P.js";
import "./index-CNBvEil4.js";
import "./index-DO_vXmCh.js";
import "./index-CH0dcRRL.js";
import "./index-BGgHy4vq.js";
import "./index-pRgia8Qu.js";
import "./index-CBELPnEy.js";
import "./chevron-down-CefZn6xR.js";
import "./check-H0qDKe8z.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Settings$1 = createLucideIcon("Settings", [
  [
    "path",
    {
      d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      key: "1qme2f"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
]);
var SWITCH_NAME = "Switch";
var [createSwitchContext, createSwitchScope] = createContextScope(SWITCH_NAME);
var [SwitchProviderImpl, useSwitchContext] = createSwitchContext(SWITCH_NAME);
function SwitchProvider(props) {
  const {
    __scopeSwitch,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: SWITCH_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    setChecked,
    disabled,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    required,
    defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(SwitchProviderImpl, { scope: __scopeSwitch, ...context, children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children });
}
var TRIGGER_NAME = "SwitchTrigger";
var SwitchTrigger = reactExports.forwardRef(
  ({ __scopeSwitch, onClick, ...switchProps }, forwardedRef) => {
    const {
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useSwitchContext(TRIGGER_NAME, __scopeSwitch);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...switchProps,
        ref: composedRefs,
        onClick: composeEventHandlers(onClick, (event) => {
          setChecked((prevChecked) => !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
SwitchTrigger.displayName = TRIGGER_NAME;
var Switch$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchProvider,
      {
        __scopeSwitch,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SwitchTrigger,
            {
              ...switchProps,
              ref: forwardedRef,
              __scopeSwitch
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SwitchBubbleInput,
            {
              __scopeSwitch
            }
          )
        ] })
      }
    );
  }
);
Switch$1.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({ __scopeSwitch, ...props }, forwardedRef) => {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useSwitchContext(BUBBLE_INPUT_NAME, __scopeSwitch);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
const DEFAULT_SETTINGS = {
  morningEnabled: false,
  morningTime: "08:00",
  eveningEnabled: false,
  eveningTime: "21:00",
  weatherBased: true
};
const morningTips = [
  "Layer up today — a blazer over a tee keeps it sharp.",
  "Try mixing textures today: denim + knit is always a win.",
  "Earth tones are trending this season. Pull that olive piece!",
  "Keep it minimal today. Less is more.",
  "It's a great day for that statement piece you haven't worn yet."
];
const eveningPrompts = [
  "How did today's outfit feel? Rate it to help the AI learn your preferences.",
  "Time for your evening reflection — did you get any compliments today?",
  "Quick check-in: was today's outfit comfortable for everything you did?",
  "Before bed, tell LEXOR® how your style went today. 30 seconds = smarter outfits.",
  "Evening reflection time ✨ Your feedback makes tomorrow's outfit even better."
];
function NotificationPreferences() {
  const [settings, setSettings] = reactExports.useState(() => {
    const saved = localStorage.getItem("luxor_notif_settings_v2");
    if (saved) return JSON.parse(saved);
    const v1 = localStorage.getItem("luxor_notif_settings");
    if (v1) {
      const old = JSON.parse(v1);
      return {
        morningEnabled: old.enabled || false,
        morningTime: old.time || "08:00",
        eveningEnabled: false,
        eveningTime: "21:00",
        weatherBased: old.weatherBased ?? true
      };
    }
    return DEFAULT_SETTINGS;
  });
  const [permissionState, setPermissionState] = reactExports.useState("default");
  reactExports.useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("luxor_notif_settings_v2", JSON.stringify(newSettings));
  };
  const anyEnabled = settings.morningEnabled || settings.eveningEnabled;
  const requestPermission = async (callback) => {
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
  const toggleMorning = (enabled) => {
    if (enabled && permissionState !== "granted") {
      requestPermission(() => saveSettings({ ...settings, morningEnabled: true }));
      return;
    }
    saveSettings({ ...settings, morningEnabled: enabled });
  };
  const toggleEvening = (enabled) => {
    if (enabled && permissionState !== "granted") {
      requestPermission(() => saveSettings({ ...settings, eveningEnabled: true }));
      return;
    }
    saveSettings({ ...settings, eveningEnabled: enabled });
  };
  reactExports.useEffect(() => {
    if (window.__luxorNotifInterval) {
      clearInterval(window.__luxorNotifInterval);
    }
    if (!anyEnabled || permissionState !== "granted") return;
    window.__luxorNotifInterval = setInterval(() => {
      const now = /* @__PURE__ */ new Date();
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
    }, 6e4);
    return () => {
      if (window.__luxorNotifInterval) {
        clearInterval(window.__luxorNotifInterval);
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
      tag: "morning-outfit"
    });
  };
  const sendEveningNotification = () => {
    const prompt = eveningPrompts[Math.floor(Math.random() * eveningPrompts.length)];
    new Notification("LEXOR® — Evening Reflection 🌙", {
      body: prompt,
      icon: "/favicon.ico",
      tag: "evening-reflection"
    });
  };
  const morningTimes = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "10:00"];
  const eveningTimes = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
      anyEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "h-5 w-5 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: "Smart Reminders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs", children: "Morning outfit & evening reflection" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-3 border-t border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-sans text-sm text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4 text-amber-400" }),
          " Morning Outfit Reminder"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: settings.morningEnabled, onCheckedChange: toggleMorning })
      ] }),
      settings.morningEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pl-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-sans text-xs text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          " Time"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: settings.morningTime, onValueChange: (v) => saveSettings({ ...settings, morningTime: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24 h-8 bg-secondary border-border text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: morningTimes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-3 border-t border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-sans text-sm text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4 text-blue-400" }),
          " Evening Reflection Reminder"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: settings.eveningEnabled, onCheckedChange: toggleEvening })
      ] }),
      settings.eveningEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pl-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "font-sans text-xs text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
          " Time"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: settings.eveningTime, onValueChange: (v) => saveSettings({ ...settings, eveningTime: v }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24 h-8 bg-secondary border-border text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: eveningTimes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
        ] })
      ] })
    ] }),
    settings.morningEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm text-muted-foreground", children: "Include weather in morning tip" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          checked: settings.weatherBased,
          onCheckedChange: (v) => saveSettings({ ...settings, weatherBased: v })
        }
      )
    ] }),
    anyEnabled && permissionState === "granted" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-3 border-t border-border/50", children: [
      settings.morningEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: sendMorningNotification,
          className: "flex-1 border-border font-sans text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Test Morning"
          ]
        }
      ),
      settings.eveningEnabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: sendEveningNotification,
          className: "flex-1 border-border font-sans text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-3.5 w-3.5 mr-1.5" }),
            " Test Evening"
          ]
        }
      )
    ] })
  ] });
}
const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = j();
  const [displayName, setDisplayName] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const isDark = theme === "dark";
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).single().then(({ data }) => {
      if (data == null ? void 0 : data.display_name) setDisplayName(data.display_name);
    });
  }, [user]);
  const toggleTheme = (dark) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings$1, { className: "h-6 w-6 text-primary" }),
        " Settings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mt-1 mb-8", children: "Manage your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "glass rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" }),
        " Profile"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm text-muted-foreground", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: (user == null ? void 0 : user.email) || "", disabled: true, className: "bg-secondary border-glass-border mt-1 opacity-60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm text-muted-foreground", children: "Display Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "bg-secondary border-glass-border mt-1" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: saving, className: "gold-gradient text-primary-foreground font-sans", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
          " Save Changes"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-5 w-5 text-primary" }),
        " Appearance"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          isDark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-5 w-5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-foreground", children: isDark ? "Dark Mode" : "Light Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans", children: isDark ? "Easy on the eyes, always stylish" : "Bright and airy aesthetic" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isDark, onCheckedChange: toggleTheme }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4 text-muted-foreground" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationPreferences, {}) })
  ] }) });
};
export {
  Settings as default
};
