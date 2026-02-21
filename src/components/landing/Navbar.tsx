import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
        <h1 className="font-display text-2xl font-bold gold-text cursor-pointer" onClick={() => navigate("/")}>
          AURELIA
        </h1>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans text-muted-foreground">
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors">How It Works</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">Pricing</button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-sans" onClick={() => navigate("/auth")}>
            Log In
          </Button>
          <Button
            size="sm"
            className="gold-gradient text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
