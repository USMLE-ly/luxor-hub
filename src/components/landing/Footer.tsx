const Footer = () => {
  return (
    <footer className="border-t border-border py-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-display text-2xl font-bold gold-text">AURELIA</h3>
          <p className="text-sm text-muted-foreground font-sans mt-1">AI Personal Stylist OS</p>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground font-sans">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        </div>
        <p className="text-xs text-muted-foreground font-sans">© 2026 AURELIA. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
