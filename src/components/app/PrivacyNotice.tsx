import { ShieldCheck } from "lucide-react";

export function PrivacyNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg bg-muted/50 border border-border p-3 ${className}`}>
      <ShieldCheck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Your images are processed by AI for analysis only and are not shared publicly. 
        Uploaded photos are stored securely in your private account.
      </p>
    </div>
  );
}
