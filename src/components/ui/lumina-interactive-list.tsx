import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import './lumina-slider.css';

declare const gsap: any;
declare const THREE: any;

const slides = [
  { title: "Effortless Style", description: "AI-curated outfits that feel like you — every single day.", media: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80" },
  { title: "Curated Looks", description: "Your wardrobe, reimagined with intelligent styling suggestions.", media: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80" },
  { title: "Street Luxe", description: "Where high fashion meets the raw energy of the city streets.", media: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80" },
  { title: "Golden Hour", description: "That fleeting confidence when every piece falls into place.", media: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80" },
  { title: "Minimalist Edge", description: "Clean lines. Bold silhouettes. Nothing more, nothing less.", media: "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=1200&q=80" },
  { title: "Power Tailoring", description: "Sharp cuts that command attention from boardroom to bar.", media: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80" },
  { title: "Boho Essence", description: "Free-spirited layers and textures that tell your story.", media: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&q=80" },
  { title: "Style DNA", description: "We decode your unique aesthetic and evolve with you.", media: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=80" },
  { title: "Urban Noir", description: "Dark palettes and structured layers for the modern sophisticate.", media: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=1200&q=80" },
  { title: "Wardrobe Intelligence", description: "Smart insights that transform how you dress, shop, and express.", media: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80" }
];

function HeroOverlay() {
  const navigate = useNavigate();
  return (
    <div className="lumina-hero-overlay">
      <div className="lumina-hero-cta">
        <motion.button
          onClick={() => navigate("/auth")}
          className="lumina-cta-primary"
          initial={{ boxShadow: '0 5px 0 0 hsl(43 74% 32%)', y: 0 }}
          whileHover={{ scale: 1.03, boxShadow: '0 7px 0 0 hsl(43 74% 32%)', transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.97, y: 4, boxShadow: '0 1px 0 0 hsl(43 74% 32%)', transition: { duration: 0.08 } }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Sparkles className="w-4 h-4" />
          Start Free
        </motion.button>
        <motion.button
          onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
          className="lumina-cta-secondary"
          initial={{ boxShadow: '0 5px 0 0 rgba(255,255,255,0.08)', y: 0 }}
          whileHover={{ scale: 1.03, boxShadow: '0 7px 0 0 rgba(255,255,255,0.1)', transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.97, y: 4, boxShadow: '0 1px 0 0 rgba(255,255,255,0.05)', transition: { duration: 0.08 } }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          How It Works
        </motion.button>
      </div>
      <div className="lumina-hero-badges">
        <span className="lumina-badge">
          <Users className="w-3 h-3" style={{ color: 'hsl(43 74% 49%)' }} /> 10K+ Users
        </span>
        <span className="lumina-badge">
          <Zap className="w-3 h-3" style={{ color: 'hsl(43 74% 49%)' }} /> AI-Powered
        </span>
        <span className="lumina-badge">
          <Sparkles className="w-3 h-3" style={{ color: 'hsl(43 74% 49%)' }} /> 98% Satisfaction
        </span>
      </div>
    </div>
  );
}

export function LuminaSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const initApplication = useCallback(() => {
    let currentSlideIndex = 0;
    let isTransitioning = false;
    let shaderMaterial: any, renderer: any, scene: any, camera: any;
    let slideTextures: any[] = [];
    let texturesLoaded = false;
    let autoSlideTimer: any = null;
    let progressAnimation: any = null;
    let sliderEnabled = false;
    let animFrameId: number;

    const SLIDE_DURATION = () => 5000;
    const PROGRESS_UPDATE_INTERVAL = 50;
    const TRANSITION_DURATION = () => 2.5;

    const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const fragmentShader = `
      uniform sampler2D uTexture1, uTexture2;
      uniform float uProgress;
      uniform vec2 uResolution, uTexture1Size, uTexture2Size;
      varying vec2 vUv;

      vec2 getCoverUV(vec2 uv, vec2 textureSize) {
        vec2 s = uResolution / textureSize;
        float scale = max(s.x, s.y);
        vec2 scaledSize = textureSize * scale;
        vec2 offset = (uResolution - scaledSize) * 0.5;
        return (uv * uResolution - offset) / scaledSize;
      }

      void main() {
        vec2 uv1 = getCoverUV(vUv, uTexture1Size);
        vec2 uv2 = getCoverUV(vUv, uTexture2Size);
        float maxR = length(uResolution) * 0.85;
        float br = uProgress * maxR;
        vec2 p = vUv * uResolution;
        vec2 c = uResolution * 0.5;
        float d = length(p - c);
        float nd = d / max(br, 0.001);
        float param = smoothstep(br + 3.0, br - 3.0, d);
        vec4 img;
        if (param > 0.0) {
          float ro = 0.08 * pow(smoothstep(0.3, 1.0, nd), 1.5);
          vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
          vec2 distUV = uv2 - dir * ro;
          float ca = 0.02 * pow(smoothstep(0.3, 1.0, nd), 1.2);
          img = vec4(
            texture2D(uTexture2, distUV + dir * ca * 1.2).r,
            texture2D(uTexture2, distUV + dir * ca * 0.2).g,
            texture2D(uTexture2, distUV - dir * ca * 0.8).b,
            1.0
          );
          float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
          img.rgb += rim * 0.08;
        } else {
          img = texture2D(uTexture2, uv2);
        }
        vec4 oldImg = texture2D(uTexture1, uv1);
        if (uProgress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (uProgress - 0.95) / 0.05);
        gl_FragColor = mix(oldImg, img, param);
      }
    `;

    const splitText = (text: string) =>
      text.split('').map(char => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`).join('');

    const updateContent = (idx: number) => {
      const titleEl = document.getElementById('mainTitle');
      const descEl = document.getElementById('mainDesc');
      if (!titleEl || !descEl) return;

      gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" });
      gsap.to(descEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" });

      setTimeout(() => {
        titleEl.innerHTML = splitText(slides[idx].title);
        
        // Typewriter effect for description
        const descText = slides[idx].description;
        const cursorSpan = '<span class="slide-description-cursor">|</span>';
        descEl.innerHTML = cursorSpan;
        gsap.set(descEl, { y: 0, opacity: 1 });
        
        const chars = descText.split('');
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex < chars.length) {
            descEl.innerHTML = descText.slice(0, charIndex + 1) + cursorSpan;
            charIndex++;
          } else {
            clearInterval(typeInterval);
            // Fade out cursor after typing completes
            setTimeout(() => {
              const cursor = descEl.querySelector('.slide-description-cursor');
              if (cursor) gsap.to(cursor, { opacity: 0, duration: 0.5 });
            }, 800);
          }
        }, 30);

        gsap.set(titleEl.children, { opacity: 0 });

        const children = titleEl.children;
        const animations: Record<number, () => void> = {
          0: () => { gsap.set(children, { y: 20 }); gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" }); },
          1: () => { gsap.set(children, { y: -20 }); gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "back.out(1.7)" }); },
          2: () => { gsap.set(children, { filter: "blur(10px)", scale: 1.5, y: 0 }); gsap.to(children, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1, stagger: { amount: 0.5, from: "random" }, ease: "power2.out" }); },
          3: () => { gsap.set(children, { scale: 0, y: 0 }); gsap.to(children, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.5)" }); },
          4: () => { gsap.set(children, { rotationX: 90, y: 0, transformOrigin: "50% 50%" }); gsap.to(children, { rotationX: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "power2.out" }); },
          5: () => { gsap.set(children, { x: 30, y: 0 }); gsap.to(children, { x: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" }); },
        };
        (animations[idx] || animations[0])();
      }, 500);
    };

    const updateNavigationState = (idx: number) =>
      document.querySelectorAll(".slide-nav-item").forEach((el, i) => el.classList.toggle("active", i === idx));

    const updateSlideProgress = (idx: number, prog: number) => {
      const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill") as HTMLElement;
      if (el) { el.style.width = `${prog}%`; el.style.opacity = '1'; }
    };

    const fadeSlideProgress = (idx: number) => {
      const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill") as HTMLElement;
      if (el) { el.style.opacity = '0'; setTimeout(() => el.style.width = "0%", 300); }
    };

    const quickResetProgress = (idx: number) => {
      const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill") as HTMLElement;
      if (el) { el.style.transition = "width 0.2s ease-out"; el.style.width = "0%"; setTimeout(() => el.style.transition = "width 0.1s ease, opacity 0.3s ease", 200); }
    };

    const updateCounter = (idx: number) => {
      const sn = document.getElementById("slideNumber"); if (sn) sn.textContent = String(idx + 1).padStart(2, "0");
      const st = document.getElementById("slideTotal"); if (st) st.textContent = String(slides.length).padStart(2, "0");
    };

    const stopAutoSlideTimer = () => {
      if (progressAnimation) clearInterval(progressAnimation);
      if (autoSlideTimer) clearTimeout(autoSlideTimer);
      progressAnimation = null; autoSlideTimer = null;
    };

    const startAutoSlideTimer = () => {
      if (!texturesLoaded || !sliderEnabled) return;
      stopAutoSlideTimer();
      let progress = 0;
      const increment = (100 / SLIDE_DURATION()) * PROGRESS_UPDATE_INTERVAL;
      progressAnimation = setInterval(() => {
        if (!sliderEnabled) { stopAutoSlideTimer(); return; }
        progress += increment;
        updateSlideProgress(currentSlideIndex, progress);
        if (progress >= 100) {
          clearInterval(progressAnimation); progressAnimation = null;
          fadeSlideProgress(currentSlideIndex);
          if (!isTransitioning) handleSlideChange();
        }
      }, PROGRESS_UPDATE_INTERVAL);
    };

    const safeStartTimer = (delay = 0) => {
      stopAutoSlideTimer();
      if (sliderEnabled && texturesLoaded) {
        if (delay > 0) autoSlideTimer = setTimeout(startAutoSlideTimer, delay);
        else startAutoSlideTimer();
      }
    };

    const ensureTextureLoaded = async (idx: number) => {
      if (slideTextures[idx]) return slideTextures[idx];
      try {
        const tex = await loadImageTexture(slides[idx].media);
        slideTextures[idx] = tex;
        return tex;
      } catch { console.warn(`Failed lazy-load texture ${idx}`); return null; }
    };

    const preloadAhead = (fromIdx: number) => {
      const next1 = (fromIdx + 1) % slides.length;
      const next2 = (fromIdx + 2) % slides.length;
      if (!slideTextures[next1]) ensureTextureLoaded(next1);
      if (!slideTextures[next2]) ensureTextureLoaded(next2);
    };

    const navigateToSlide = async (targetIndex: number) => {
      if (isTransitioning || targetIndex === currentSlideIndex) return;
      stopAutoSlideTimer();
      quickResetProgress(currentSlideIndex);

      const currentTexture = slideTextures[currentSlideIndex];
      const targetTexture = await ensureTextureLoaded(targetIndex);
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

      gsap.fromTo(shaderMaterial.uniforms.uProgress,
        { value: 0 },
        {
          value: 1, duration: TRANSITION_DURATION(), ease: "power2.inOut",
          onComplete: () => {
                        shaderMaterial.uniforms.uProgress.value = 0;
                        shaderMaterial.uniforms.uTexture1.value = targetTexture;
                        shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
                        isTransitioning = false;
                        preloadAhead(currentSlideIndex);
                        safeStartTimer(100);
                      }
        }
      );
    };

    const handleSlideChange = () => {
      if (isTransitioning || !texturesLoaded || !sliderEnabled) return;
      navigateToSlide((currentSlideIndex + 1) % slides.length);
    };

    const createSlidesNavigation = () => {
      const nav = document.getElementById("slidesNav"); if (!nav) return;
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

    const loadImageTexture = (src: string) => new Promise<any>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const t = new THREE.Texture(img);
        t.minFilter = t.magFilter = THREE.LinearFilter;
        t.needsUpdate = true;
        t.userData = { size: new THREE.Vector2(img.width, img.height) };
        resolve(t);
      };
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
    });

    const initRenderer = async () => {
      const canvas = containerRef.current?.querySelector(".webgl-canvas") as HTMLCanvasElement;
      if (!canvas) return;
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture1: { value: null }, uTexture2: { value: null }, uProgress: { value: 0 },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uTexture1Size: { value: new THREE.Vector2(1, 1) }, uTexture2Size: { value: new THREE.Vector2(1, 1) },
        },
        vertexShader, fragmentShader
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

      // Only load first 3 textures eagerly, rest lazy-loaded on demand
      slideTextures = new Array(slides.length).fill(null);
      for (let i = 0; i < Math.min(3, slides.length); i++) {
        try { slideTextures[i] = await loadImageTexture(slides[i].media); } catch { console.warn("Failed texture load", i); }
      }

      const firstValid = slideTextures.find(t => t !== null);
      if (firstValid) {
        const secondValid = slideTextures.find((t, i) => t !== null && t !== firstValid) || firstValid;
        shaderMaterial.uniforms.uTexture1.value = firstValid;
        shaderMaterial.uniforms.uTexture2.value = secondValid;
        shaderMaterial.uniforms.uTexture1Size.value = firstValid.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value = secondValid.userData.size;
        texturesLoaded = true; sliderEnabled = true;
        containerRef.current?.querySelector(".slider-wrapper")?.classList.add("loaded");
        safeStartTimer(500);
      }

      const render = () => { animFrameId = requestAnimationFrame(render); renderer.render(scene, camera); };
      render();
    };

    createSlidesNavigation();
    updateCounter(0);

    const tEl = document.getElementById('mainTitle');
    const dEl = document.getElementById('mainDesc');
    if (tEl && dEl) {
      tEl.innerHTML = splitText(slides[0].title);
      // Initial typewriter for first slide description
      const firstDesc = slides[0].description;
      const cursorSpan = '<span class="slide-description-cursor">|</span>';
      dEl.innerHTML = cursorSpan;
      gsap.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.5 });
      
      setTimeout(() => {
        const chars = firstDesc.split('');
        let ci = 0;
        const ti = setInterval(() => {
          if (ci < chars.length) {
            dEl.innerHTML = firstDesc.slice(0, ci + 1) + cursorSpan;
            ci++;
          } else {
            clearInterval(ti);
            setTimeout(() => {
              const cursor = dEl.querySelector('.slide-description-cursor');
              if (cursor) gsap.to(cursor, { opacity: 0, duration: 0.5 });
            }, 800);
          }
        }, 30);
      }, 800);
    }

    initRenderer();

    const onVisChange = () => document.hidden ? stopAutoSlideTimer() : (!isTransitioning && safeStartTimer());
    const onResize = () => {
      if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("resize", onResize);

    cleanupRef.current = () => {
      stopAutoSlideTimer();
      cancelAnimationFrame(animFrameId);
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("resize", onResize);
      if (renderer) { renderer.dispose(); renderer.forceContextLoss(); }
      slideTextures.forEach(t => t?.dispose?.());
      sliderEnabled = false;
    };
  }, []);

  useEffect(() => {
    const loadScript = (src: string, globalName: string) => new Promise<void>((res, rej) => {
      if ((window as any)[globalName]) { res(); return; }
      if (document.querySelector(`script[src="${src}"]`)) {
        const check = setInterval(() => { if ((window as any)[globalName]) { clearInterval(check); res(); } }, 50);
        setTimeout(() => { clearInterval(check); rej(new Error(`Timeout: ${globalName}`)); }, 10000);
        return;
      }
      const s = document.createElement('script');
      s.src = src; s.onload = () => setTimeout(() => res(), 100); s.onerror = () => rej(new Error(`Failed: ${src}`));
      document.head.appendChild(s);
    });

    (async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE');
      } catch (e) { console.error('Script load failed:', e); return; }
      initApplication();
    })();

    return () => { cleanupRef.current?.(); };
  }, [initApplication]);

  return (
    <div ref={containerRef} className="lumina-hero-container">
      <div className="lumina-aurora" />
      <div className="lumina-bottom-gradient" />

      <main className="slider-wrapper">
        <div className="lumina-fallback-bg" />
        <canvas className="webgl-canvas" />
        <span className="slide-number" id="slideNumber">01</span>
        <span className="slide-total" id="slideTotal">10</span>

        <div className="slide-content">
          <h1 className="slide-title" id="mainTitle">{slides[0].title}</h1>
          <p className="slide-description" id="mainDesc">{slides[0].description}</p>
        </div>

        <HeroOverlay />

        <nav className="slides-navigation" id="slidesNav"></nav>
      </main>
    </div>
  );
}

export default LuminaSlider;
