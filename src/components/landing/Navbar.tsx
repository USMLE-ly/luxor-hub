import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, Diamond } from "lucide-react";
import { MagneticCursor } from "@/components/ui/magnetic-cursor";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["features", "how-it-works", "pricing", "faq"];
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setSheetOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-2.5" : "py-5"
      }`}
    >
      {scrolled && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
      )}

      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <motion.h1
          className="font-display text-2xl font-bold gold-text cursor-pointer flex items-center gap-1.5"
          onClick={() => navigate("/")}
          whileHover={{ letterSpacing: "0.08em" }}
          transition={{ duration: 0.3 }}
        >
          <Diamond className="w-5 h-5 text-primary fill-primary/20" />
          AURELIA
        </motion.h1>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="relative py-1 transition-colors hover:text-foreground"
            >
              <span className={activeSection === link.id ? "text-primary font-medium" : "text-muted-foreground"}>
                {link.label}
              </span>
              {activeSection === link.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full will-change-transform"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex font-sans"
            onClick={() => scrollTo("pricing")}
          >
            View Plans
          </Button>
          <MagneticCursor className="hidden md:block relative" strength={0.3} radius={70}>
            <RainbowButton
              onClick={() => navigate("/auth")}
              className="h-9 px-4 text-sm font-semibold"
            >
              Get Started
            </RainbowButton>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse" />
          </MagneticCursor>

          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 glass-strong border-l border-border p-0">
              <div className="flex flex-col h-full pt-16 px-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.id)}
                      className={`text-left py-3 text-base font-sans transition-colors border-b border-primary/10 ${
                        activeSection === link.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-primary/40 to-transparent my-6" />

                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full font-sans" onClick={() => { setSheetOpen(false); navigate("/auth"); }}>
                    Log In
                  </Button>
                  <RainbowButton
                    onClick={() => { setSheetOpen(false); navigate("/auth"); }}
                    className="w-full h-10 text-sm font-semibold"
                  >
                    Get Started
                  </RainbowButton>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
