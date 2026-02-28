import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <h1
          className="font-display text-2xl font-bold gold-text cursor-pointer transition-all duration-300 hover:drop-shadow-[0_0_8px_hsl(43,74%,49%,0.5)]"
          onClick={() => navigate("/")}
        >
          AURELIA
        </h1>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans text-muted-foreground">
          {navLinks.map((link) => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="hover:text-foreground transition-colors">
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Desktop buttons */}
          <Button variant="ghost" size="sm" className="hidden md:inline-flex font-sans" onClick={() => navigate("/auth")}>
            Log In
          </Button>
          <RainbowButton
            onClick={() => navigate("/auth")}
            className="hidden md:inline-flex h-9 px-4 text-sm font-semibold"
          >
            Get Started
          </RainbowButton>

          {/* Mobile hamburger */}
          <Sheet>
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
                      className="text-left py-3 text-base font-sans text-muted-foreground hover:text-foreground transition-colors border-b border-primary/10"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="h-px w-full bg-gradient-to-r from-primary/40 to-transparent my-6" />

                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full font-sans" onClick={() => navigate("/auth")}>
                    Log In
                  </Button>
                  <RainbowButton
                    onClick={() => navigate("/auth")}
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
