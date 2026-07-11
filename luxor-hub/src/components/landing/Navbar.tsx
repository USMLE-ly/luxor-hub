import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {List} from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();

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
    { label: "Deep Dive", id: "deep-dive", isRoute: true },
    { label: "Blog", id: "blog", isRoute: true },
  ];

  return (
    <motion.nav
      aria-label="Main navigation"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
        scrolled ? "py-2" : "py-5"
      }`}
    >
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "w-[95%] max-w-4xl bg-emerald/70 backdrop-blur-2xl border border-white/[0.06] shadow-2xl shadow-forest/30 rounded-full px-4"
            : "w-full max-w-6xl bg-transparent px-4"
        }`}
      >
        <div className="flex items-center justify-between h-12 md:h-14">
        <motion.h1
          className="font-display text-2xl font-bold text-foreground cursor-pointer relative"
          onClick={() => navigate("/")}
          whileHover={{ letterSpacing: "0.08em" }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-foreground via-gold to-foreground bg-[length:200%_100%] bg-clip-text text-transparent"
          >
            LUXOR®
          </motion.span>
        </motion.h1>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans">
          {navLinks.map((link) => (
            <motion.button
              key={link.id}
              onClick={() => (link as any).isRoute ? navigate(`/${link.id}`) : scrollTo(link.id)}
              aria-current={activeSection === link.id ? "page" : undefined}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="relative py-1 transition-colors hover:text-foreground"
            >
              <span className={activeSection === link.id ? "text-foreground font-medium" : "text-muted-foreground"}>
                {link.label}
              </span>
              {activeSection === link.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/80 to-gold rounded-full will-change-transform"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        </div>

        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="hidden md:inline-flex"
          >
            <Button
              variant="ghost"
              size="sm"
              className="font-sans"
              onClick={() => navigate("/auth")}
            >
              Log In
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="hidden md:inline-flex"
          >
            <Button
              variant="outline"
              size="sm"
              className="font-sans border-foreground/20 hover:bg-foreground/5"
              onClick={() => navigate("/auth")}
            >
              Try LUXOR®
            </Button>
          </motion.div>

          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" aria-expanded={sheetOpen}>
                <List className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass border-l border-border/10 p-0 backdrop-blur-3xl bg-forest/95">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <div className="flex flex-col h-full pt-20 px-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                      animate={sheetOpen ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(2px)" }}
                      transition={{ delay: sheetOpen ? 0.1 + idx * 0.04 : 0, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <button
                        onClick={() => (link as any).isRoute ? (() => { setSheetOpen(false); navigate(`/${link.id}`); })() : scrollTo(link.id)}
                        className={`text-left py-3 text-base font-sans transition-colors border-b border-border w-full ${
                          activeSection === link.id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="h-px w-full bg-border my-6" />

                <div className="flex flex-col gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={sheetOpen ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    transition={{ delay: sheetOpen ? 0.35 : 0, duration: 0.4 }}
                  >
                    <Button variant="outline" className="w-full font-sans border-white/10 hover:bg-white/5" onClick={() => { setSheetOpen(false); navigate("/auth"); }}>
                      Log In
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={sheetOpen ? { opacity: 1, y: 0 } : { opacity: 0 }}
                    transition={{ delay: sheetOpen ? 0.4 : 0, duration: 0.4 }}
                  >
                    <Button
                      onClick={() => { setSheetOpen(false); navigate("/auth"); }}
                      className="w-full h-10 text-sm font-semibold gold-gradient text-primary-foreground"
                    >
                      Try LUXOR®
                    </Button>
                  </motion.div>
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
