import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import proofImg1 from "@/assets/proof-1.jpg";
import proofImg2 from "@/assets/proof-2.jpeg";
import proofImg3 from "@/assets/proof-3.jpg";
import proofImg4 from "@/assets/proof-4.png";

declare const gsap: any;
declare const THREE: any;

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadScripts = async () => {
      const loadScript = (src: string, globalName: string) =>
        new Promise<void>((res, rej) => {
          if ((window as any)[globalName]) { res(); return; }
          if (document.querySelector(`script[src="${src}"]`)) {
            const check = setInterval(() => {
              if ((window as any)[globalName]) { clearInterval(check); res(); }
            }, 50);
            setTimeout(() => { clearInterval(check); rej(new Error(`Timeout waiting for ${globalName}`)); }, 10000);
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          s.onload = () => { setTimeout(() => res(), 100); };
          s.onerror = () => rej(new Error(`Failed to load ${src}`));
          document.head.appendChild(s);
        });

      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js", "gsap");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "THREE");
      } catch (e) {
        console.error("Failed to load scripts:", e);
      }
      initApplication();
    };

    const initApplication = () => {
      const SLIDER_CONFIG: any = {
        settings: {
          transitionDuration: 2.5, autoSlideSpeed: 5000, currentEffect: "glass", currentEffectPreset: "Default",
          globalIntensity: 1.0, speedMultiplier: 1.0, distortionStrength: 1.0, colorEnhancement: 1.0,
          glassRefractionStrength: 1.0, glassChromaticAberration: 1.0, glassBubbleClarity: 1.0, glassEdgeGlow: 1.0, glassLiquidFlow: 1.0,
          frostIntensity: 1.5, frostCrystalSize: 1.0, frostIceCoverage: 1.0, frostTemperature: 1.0, frostTexture: 1.0,
          rippleFrequency: 25.0, rippleAmplitude: 0.08, rippleWaveSpeed: 1.0, rippleRippleCount: 1.0, rippleDecay: 1.0,
          plasmaIntensity: 1.2, plasmaSpeed: 0.8, plasmaEnergyIntensity: 0.4, plasmaContrastBoost: 0.3, plasmaTurbulence: 1.0,
          timeshiftDistortion: 1.6, timeshiftBlur: 1.5, timeshiftFlow: 1.4, timeshiftChromatic: 1.5, timeshiftTurbulence: 1.4,
        },
      };

      let currentSlideIndex = 0;
      let isTransitioning = false;
      let shaderMaterial: any, renderer: any, scene: any, camera: any;
      let slideTextures: any[] = [];
      let texturesLoaded = false;
      let autoSlideTimer: any = null;
      let progressAnimation: any = null;
      let sliderEnabled = false;
      let animFrameId: number;

      const SLIDE_DURATION = () => SLIDER_CONFIG.settings.autoSlideSpeed;
      const TRANSITION_DURATION = () => SLIDER_CONFIG.settings.transitionDuration;

      const slides = [
        { title: "Style DNA", description: "Discover your unique style profile with AI-powered analysis.", media: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80&auto=format" },
        { title: "Capsule Wardrobe", description: "Build the perfect 30-piece wardrobe tailored to your lifestyle.", media: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80&auto=format" },
        { title: "Closet Scanner", description: "Digitize your entire wardrobe in seconds with AI recognition.", media: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1920&q=80&auto=format" },
        { title: "Golden Hour", description: "Find the perfect outfit for every occasion, every mood.", media: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80&auto=format" },
        { title: "Color Analysis", description: "Unlock your ideal palette with precision color matching.", media: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80&auto=format" },
        { title: "Shop Smarter", description: "Curated picks from top brands that match your style DNA.", media: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80&auto=format" },
      ];

      const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
      const fragmentShader = `
        uniform sampler2D uTexture1, uTexture2;
        uniform float uProgress;
        uniform vec2 uResolution, uTexture1Size, uTexture2Size;
        uniform int uEffectType;
        uniform float uGlobalIntensity, uSpeedMultiplier, uDistortionStrength, uColorEnhancement;
        uniform float uGlassRefractionStrength, uGlassChromaticAberration, uGlassBubbleClarity, uGlassEdgeGlow, uGlassLiquidFlow;
        varying vec2 vUv;

        vec2 getCoverUV(vec2 uv, vec2 textureSize) {
          vec2 s = uResolution / textureSize;
          float scale = max(s.x, s.y);
          vec2 scaledSize = textureSize * scale;
          vec2 offset = (uResolution - scaledSize) * 0.5;
          return (uv * uResolution - offset) / scaledSize;
        }

        vec4 glassEffect(vec2 uv, float progress) {
          float time = progress * 5.0 * uSpeedMultiplier;
          vec2 uv1 = getCoverUV(uv, uTexture1Size);
          vec2 uv2 = getCoverUV(uv, uTexture2Size);
          float maxR = length(uResolution) * 0.85;
          float br = progress * maxR;
          vec2 p = uv * uResolution;
          vec2 c = uResolution * 0.5;
          float d = length(p - c);
          float nd = d / max(br, 0.001);
          float param = smoothstep(br + 3.0, br - 3.0, d);
          vec4 img;
          if (param > 0.0) {
            float ro = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity * pow(smoothstep(0.3 * uGlassBubbleClarity, 1.0, nd), 1.5);
            vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
            vec2 distUV = uv2 - dir * ro;
            distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * uGlassLiquidFlow * uSpeedMultiplier * nd * param;
            float ca = 0.02 * uGlassChromaticAberration * uGlobalIntensity * pow(smoothstep(0.3, 1.0, nd), 1.2);
            img = vec4(
              texture2D(uTexture2, distUV + dir * ca * 1.2).r,
              texture2D(uTexture2, distUV + dir * ca * 0.2).g,
              texture2D(uTexture2, distUV - dir * ca * 0.8).b,
              1.0
            );
            if (uGlassEdgeGlow > 0.0) {
              float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
              img.rgb += rim * 0.08 * uGlassEdgeGlow * uGlobalIntensity;
            }
          } else {
            img = texture2D(uTexture2, uv2);
          }
          vec4 oldImg = texture2D(uTexture1, uv1);
          if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
          return mix(oldImg, img, param);
        }

        void main() {
          gl_FragColor = glassEffect(vUv, uProgress);
        }
      `;

      const getEffectIndex = () => 0;

      const splitText = (text: string) =>
        text.split("").map((char) => `<span style="display: inline-block; opacity: 0;">${char === " " ? "&nbsp;" : char}</span>`).join("");

      const updateContent = (idx: number) => {
        const titleEl = document.getElementById("mainTitle");
        const descEl = document.getElementById("mainDesc");
        if (!titleEl || !descEl) return;

        gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" });
        gsap.to(descEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" });

        setTimeout(() => {
          titleEl.innerHTML = splitText(slides[idx].title);
          descEl.textContent = slides[idx].description;
          gsap.set(titleEl.children, { opacity: 0 });
          gsap.set(descEl, { y: 20, opacity: 0 });

          const children = titleEl.children;
          switch (idx % 6) {
            case 0:
              gsap.set(children, { y: 20 });
              gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
              break;
            case 1:
              gsap.set(children, { y: -20 });
              gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "back.out(1.7)" });
              break;
            case 2:
              gsap.set(children, { filter: "blur(10px)", scale: 1.5, y: 0 });
              gsap.to(children, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1, stagger: { amount: 0.5, from: "random" }, ease: "power2.out" });
              break;
            case 3:
              gsap.set(children, { scale: 0, y: 0 });
              gsap.to(children, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.5)" });
              break;
            case 4:
              gsap.set(children, { rotationX: 90, y: 0, transformOrigin: "50% 50%" });
              gsap.to(children, { rotationX: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "power2.out" });
              break;
            case 5:
              gsap.set(children, { x: 30, y: 0 });
              gsap.to(children, { x: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
              break;
          }
          gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
        }, 500);
      };

      const updateCounter = (idx: number) => {
        const el = document.getElementById("slideCounter");
        if (el) el.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      };

      const updateNavigationState = (idx: number) =>
        document.querySelectorAll(".slide-nav-item").forEach((el, i) => el.classList.toggle("active", i === idx));

      const updateSlideProgress = (idx: number, prog: number) => {
        const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill") as HTMLElement;
        if (el) { el.style.width = `${prog}%`; el.style.opacity = "1"; }
      };

      const quickResetProgress = (idx: number) => {
        const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill") as HTMLElement;
        if (el) { el.style.opacity = "0"; setTimeout(() => (el.style.width = "0%"), 300); }
      };

      const stopAutoSlideTimer = () => {
        if (autoSlideTimer) { clearInterval(autoSlideTimer); autoSlideTimer = null; }
        if (progressAnimation) { progressAnimation.kill(); progressAnimation = null; }
      };

      const navigateToSlide = (targetIndex: number) => {
        if (isTransitioning || targetIndex === currentSlideIndex) return;
        stopAutoSlideTimer();
        quickResetProgress(currentSlideIndex);

        const currentTexture = slideTextures[currentSlideIndex];
        const targetTexture = slideTextures[targetIndex];
        if (!currentTexture || !targetTexture) return;

        isTransitioning = true;
        shaderMaterial.uniforms.uTexture1.value = currentTexture;
        shaderMaterial.uniforms.uTexture2.value = targetTexture;
        shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;

        updateContent(targetIndex);
        currentSlideIndex = targetIndex;
        updateCounter(currentSlideIndex);
        updateNavigationState(currentSlideIndex);

        gsap.fromTo(
          shaderMaterial.uniforms.uProgress,
          { value: 0 },
          {
            value: 1,
            duration: TRANSITION_DURATION(),
            ease: "power2.inOut",
            onComplete: () => {
              shaderMaterial.uniforms.uProgress.value = 0;
              shaderMaterial.uniforms.uTexture1.value = targetTexture;
              shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
              isTransitioning = false;
              safeStartTimer(100);
            },
          }
        );
      };

      const handleSlideChange = () => {
        if (isTransitioning || !texturesLoaded || !sliderEnabled) return;
        navigateToSlide((currentSlideIndex + 1) % slides.length);
      };

      const createSlidesNavigation = () => {
        const nav = document.getElementById("slidesNav");
        if (!nav) return;
        nav.innerHTML = "";
        slides.forEach((slide, i) => {
          const item = document.createElement("div");
          item.className = `slide-nav-item${i === 0 ? " active" : ""}`;
          item.dataset.slideIndex = String(i);
          item.innerHTML = `<div class="slide-progress-line"><div class="slide-progress-fill"></div></div><div class="slide-nav-title">${slide.title}</div>`;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isTransitioning && i !== currentSlideIndex) {
              stopAutoSlideTimer();
              quickResetProgress(currentSlideIndex);
              navigateToSlide(i);
            }
          });
          nav.appendChild(item);
        });
      };

      const safeStartTimer = (delay = 0) => {
        stopAutoSlideTimer();
        setTimeout(() => {
          let elapsed = 0;
          const duration = SLIDE_DURATION();
          const interval = 50;
          autoSlideTimer = setInterval(() => {
            elapsed += interval;
            const prog = (elapsed / duration) * 100;
            updateSlideProgress(currentSlideIndex, Math.min(prog, 100));
            if (elapsed >= duration) {
              stopAutoSlideTimer();
              handleSlideChange();
            }
          }, interval);
        }, delay);
      };

      // --- THREE.JS SETUP ---
      const canvas = document.getElementById("heroCanvas") as HTMLCanvasElement;
      if (!canvas || typeof THREE === "undefined") return;

      const container = containerRef.current;
      if (!container) return;

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
      camera.position.z = 1;

      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture1: { value: null },
          uTexture2: { value: null },
          uProgress: { value: 0 },
          uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
          uTexture1Size: { value: new THREE.Vector2(1, 1) },
          uTexture2Size: { value: new THREE.Vector2(1, 1) },
          uEffectType: { value: 0 },
          uGlobalIntensity: { value: 1.0 },
          uSpeedMultiplier: { value: 1.0 },
          uDistortionStrength: { value: 1.0 },
          uColorEnhancement: { value: 1.0 },
          uGlassRefractionStrength: { value: 1.0 },
          uGlassChromaticAberration: { value: 1.0 },
          uGlassBubbleClarity: { value: 1.0 },
          uGlassEdgeGlow: { value: 1.0 },
          uGlassLiquidFlow: { value: 1.0 },
        },
        vertexShader,
        fragmentShader,
      });

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shaderMaterial);
      scene.add(plane);

      // Load textures
      const loader = new THREE.TextureLoader();
      loader.crossOrigin = "anonymous";
      let loadedCount = 0;

      slides.forEach((slide, i) => {
        loader.load(slide.media, (texture: any) => {
          texture.userData = { size: new THREE.Vector2(texture.image.width, texture.image.height) };
          slideTextures[i] = texture;
          loadedCount++;
          if (loadedCount === slides.length) {
            texturesLoaded = true;
            shaderMaterial.uniforms.uTexture1.value = slideTextures[0];
            shaderMaterial.uniforms.uTexture1Size.value = slideTextures[0].userData.size;
            shaderMaterial.uniforms.uTexture2.value = slideTextures[0];
            shaderMaterial.uniforms.uTexture2Size.value = slideTextures[0].userData.size;

            createSlidesNavigation();
            updateCounter(0);

            // Initial title animation
            const titleEl = document.getElementById("mainTitle");
            const descEl = document.getElementById("mainDesc");
            if (titleEl) {
              titleEl.innerHTML = splitText(slides[0].title);
              gsap.set(titleEl.children, { y: 20, opacity: 0 });
              gsap.to(titleEl.children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out", delay: 0.3 });
            }
            if (descEl) {
              descEl.textContent = slides[0].description;
              gsap.set(descEl, { y: 20, opacity: 0 });
              gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power3.out" });
            }

            sliderEnabled = true;
            safeStartTimer(500);
          }
        });
      });

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h);
        shaderMaterial.uniforms.uResolution.value.set(w, h);
      };
      window.addEventListener("resize", handleResize);

      // Arrow navigation
      const prevBtn = document.getElementById("heroPrev");
      const nextBtn = document.getElementById("heroNext");
      prevBtn?.addEventListener("click", () => {
        if (!isTransitioning) navigateToSlide((currentSlideIndex - 1 + slides.length) % slides.length);
      });
      nextBtn?.addEventListener("click", () => {
        if (!isTransitioning) navigateToSlide((currentSlideIndex + 1) % slides.length);
      });

      // Keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (isTransitioning) return;
        if (e.key === "ArrowLeft") navigateToSlide((currentSlideIndex - 1 + slides.length) % slides.length);
        if (e.key === "ArrowRight") navigateToSlide((currentSlideIndex + 1) % slides.length);
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);
        cancelAnimationFrame(animFrameId);
        stopAutoSlideTimer();
        renderer?.dispose();
      };
    };

    loadScripts();
  }, []);

  const avatars = [proofImg1, proofImg2, proofImg3, proofImg4];

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-background">
      {/* WebGL Canvas */}
      <canvas id="heroCanvas" className="absolute inset-0 w-full h-full" />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50 pointer-events-none z-[1]" />

      {/* Gold accent line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-[2]" />

      {/* Content overlay */}
      <div className="absolute inset-0 z-[2] flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16 lg:px-24">
        {/* Slide title & description */}
        <div className="max-w-3xl space-y-4">
          <h1
            id="mainTitle"
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, hsl(43 74% 49%), hsl(40 90% 80%), hsl(43 74% 49%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
            }}
          />
          <p
            id="mainDesc"
            className="text-lg md:text-xl max-w-xl"
            style={{ color: "hsl(40 20% 85%)" }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 mt-8">
          <button
            onClick={() => navigate("/onboarding")}
            className="px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, hsl(43 74% 49%), hsl(40 60% 40%))",
              color: "hsl(40 30% 97%)",
              boxShadow: "0 0 30px hsl(43 74% 49% / 0.3), 0 4px 20px hsl(0 0% 0% / 0.3)",
            }}
          >
            Get Started Free
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-xl"
            style={{
              background: "hsl(0 0% 100% / 0.08)",
              color: "hsl(40 20% 85%)",
              border: "1px solid hsl(43 74% 49% / 0.2)",
            }}
          >
            See how it works
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-xs" style={{ color: "hsl(40 15% 55%)" }}>
          *No credit card required · Cancel anytime
        </p>

        {/* Social proof */}
        <div className="flex items-center gap-3 mt-6">
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-8 h-8 rounded-full border-2 object-cover"
                style={{ borderColor: "hsl(43 74% 49% / 0.4)" }}
              />
            ))}
          </div>
          <span className="text-sm" style={{ color: "hsl(40 15% 65%)" }}>
            Join over 10,000+ style-conscious people
          </span>
        </div>
      </div>

      {/* Counter */}
      <div
        id="slideCounter"
        className="absolute top-8 right-8 z-[3] text-sm font-mono tracking-widest"
        style={{ color: "hsl(43 74% 49% / 0.6)" }}
      />

      {/* Arrow navigation */}
      <div className="absolute right-8 bottom-24 md:bottom-32 z-[3] flex flex-col gap-2">
        <button
          id="heroPrev"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md"
          style={{ background: "hsl(0 0% 100% / 0.06)", border: "1px solid hsl(43 74% 49% / 0.15)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(43, 74%, 49%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
        </button>
        <button
          id="heroNext"
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md"
          style={{ background: "hsl(0 0% 100% / 0.06)", border: "1px solid hsl(43 74% 49% / 0.15)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(43, 74%, 49%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>

      {/* Slides navigation bar */}
      <div id="slidesNav" className="absolute bottom-8 left-6 md:left-16 lg:left-24 z-[3] flex items-end gap-3" />

      {/* Gold accent line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent z-[2]" />

      {/* Inline styles for nav items */}
      <style>{`
        .slide-nav-item {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          opacity: 0.4;
          transition: opacity 0.3s ease;
          min-width: 60px;
        }
        .slide-nav-item.active { opacity: 1; }
        .slide-nav-item:hover { opacity: 0.8; }
        .slide-progress-line {
          width: 100%;
          height: 2px;
          background: hsl(43 74% 49% / 0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        .slide-progress-fill {
          height: 100%;
          width: 0%;
          background: hsl(43, 74%, 49%);
          border-radius: 2px;
          transition: opacity 0.3s ease;
        }
        .slide-nav-title {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: hsl(40 20% 75%);
          font-weight: 500;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .slide-nav-title { display: none; }
          .slide-nav-item { min-width: 40px; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
