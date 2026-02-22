import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { StyleInspirationFeed } from "@/components/app/StyleInspirationFeed";
import { SocialFeed } from "@/components/app/SocialFeed";
import { Sparkles, Users } from "lucide-react";

const Inspiration = () => {
  const [tab, setTab] = useState<"inspiration" | "social">("inspiration");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tab Switcher */}
          <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 w-fit mb-6">
            <button
              onClick={() => setTab("inspiration")}
              className={`px-5 py-2.5 rounded-lg text-sm font-sans flex items-center gap-2 transition-all ${
                tab === "inspiration"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" /> Inspiration
            </button>
            <button
              onClick={() => setTab("social")}
              className={`px-5 py-2.5 rounded-lg text-sm font-sans flex items-center gap-2 transition-all ${
                tab === "social"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-4 w-4" /> Social Feed
            </button>
          </div>

          {tab === "inspiration" ? <StyleInspirationFeed /> : <SocialFeed />}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Inspiration;
