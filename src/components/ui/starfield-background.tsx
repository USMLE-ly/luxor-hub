import "./starfield.css";

const StarfieldBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
    {/* Static tiny stars layer */}
    <div className="starfield-layer starfield-small" />
    {/* Medium stars, slower drift */}
    <div className="starfield-layer starfield-medium" />
    {/* Large bright stars, slowest */}
    <div className="starfield-layer starfield-large" />
    {/* Shooting stars */}
    <div className="shooting-star shooting-star-1" />
    <div className="shooting-star shooting-star-2" />
    <div className="shooting-star shooting-star-3" />
    <div className="shooting-star shooting-star-4" />
    <div className="shooting-star shooting-star-5" />
    {/* Subtle sky gradient overlay */}
    <div className="absolute inset-0 pointer-events-none" style={{
      background: 'radial-gradient(ellipse at 50% 0%, hsl(240 30% 12% / 0.6) 0%, transparent 70%)',
    }} />
  </div>
);

export default StarfieldBackground;
