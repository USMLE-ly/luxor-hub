import { useEffect, useRef } from "react";
import * as THREE from "three";

const AuroraBackground = ({ className = "" }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
    // Render at half resolution for performance
    const dpr = Math.min(window.devicePixelRatio, 1);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(container.clientWidth * dpr, container.clientHeight * dpr) },
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 ip = floor(p); vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);
          return mix(mix(rand(ip), rand(ip+vec2(1,0)), u.x), mix(rand(ip+vec2(0,1)), rand(ip+vec2(1,1)), u.x), u.y);
        }
        void main(){
          vec2 p = ((gl_FragCoord.xy) - iResolution.xy * 0.5) / iResolution.y * mat2(6.0,-4.0,4.0,6.0);
          vec4 o = vec4(0.0);
          float f = 2.0 + noise(p + vec2(iTime * 2.0, 0.0)) * 0.5;
          for(float i = 0.0; i < 18.0; i++){
            vec2 v = p + cos(i*i + iTime * 0.025 + i * vec2(13.0, 11.0)) * 3.5;
            vec4 ac = vec4(
              0.1 + 0.3*sin(i*0.2 + iTime*0.4),
              0.3 + 0.5*cos(i*0.3 + iTime*0.5),
              0.7 + 0.3*sin(i*0.4 + iTime*0.3),
              1.0
            );
            vec4 cc = ac * exp(sin(i*i + iTime*0.8)) / length(max(v, vec2(v.x*f*0.015, v.y*1.5)));
            float tf = smoothstep(0.0, 1.0, i/18.0) * 0.6;
            o += cc * tf;
          }
          o = tanh(pow(o / 60.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    let lastTime = 0;
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      // Throttle to ~30fps
      if (time - lastTime < 33) return;
      lastTime = time;
      material.uniforms.iTime.value += 0.033;
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w * dpr, h * dpr);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />;
};

export default AuroraBackground;
