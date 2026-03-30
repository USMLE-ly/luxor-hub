import React, { useEffect, useRef, useState } from 'react';

const ParallaxPage = () => {
  const featureRef = useRef<HTMLDivElement>(null);
  const opaqueRef = useRef<HTMLDivElement>(null);
  const [showOpaque, setShowOpaque] = useState(false);

  useEffect(() => {
    const featureEl = featureRef.current;
    if (!featureEl) return;

    const computedBgSize = window
      .getComputedStyle(featureEl)
      .getPropertyValue('background-size');
    const zoomFactor = parseFloat(computedBgSize) / 100;
    const featureWidth = featureEl.clientWidth;
    const initialSizePx = zoomFactor * featureWidth;

    const isChrome =
      /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari =
      /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

    if (!isChrome && !isSafari) {
      setShowOpaque(true);
    }

    const onScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const newSize = initialSizePx - scrollTop / 3;

      if (newSize > featureWidth) {
        featureEl.style.backgroundSize = `${newSize}px`;
        const blurAmount = scrollTop / 100;
        featureEl.style.filter = `blur(${blurAmount}px)`;
        featureEl.style.opacity = `${1 - (scrollTop / document.documentElement.scrollHeight) * 1.3}`;
      }

      if (opaqueRef.current) {
        const opacity = Math.min(1, scrollTop / 5000);
        opaqueRef.current.style.opacity = String(opacity);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div
        ref={featureRef}
        className="fixed top-0 left-0 right-0 w-full z-0 overflow-hidden"
        style={{
          paddingTop: '50%',
          backgroundImage:
            "url('https://images.unsplash.com/photo-1619410283995-43d9134e7656?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '250%',
          boxShadow: '0 -50px 20px -20px hsl(var(--background)) inset',
        }}
      >
        {showOpaque && (
          <div
            ref={opaqueRef}
            className="absolute inset-0 bg-muted"
            style={{ opacity: 0 }}
          />
        )}
      </div>

      <div className="relative z-10 w-[90%] mx-auto pt-[45%] sm:w-[60%] sm:pt-[35%]">
        <h2 className="text-2xl font-semibold mb-4">Heading</h2>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent
          libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum
          imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
          Mauris massa. Vestibulum lacinia arcu eget nulla.
        </p>
        <p className="mb-4">
          Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur
          tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed
          convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus,
          iaculis vel, suscipit quis, luctus non, massa.
        </p>
        <p className="mb-8">
          Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper
          vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent
          taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Heading</h2>
        <p className="mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent
          libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum
          imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta.
          Mauris massa. Vestibulum lacinia arcu eget nulla.
        </p>
        <p className="mb-4">
          Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur
          tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed
          convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus,
          iaculis vel, suscipit quis, luctus non, massa.
        </p>
        <p className="mb-8">
          Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper
          vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent
          taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
        </p>
      </div>
    </div>
  );
};

export default ParallaxPage;
