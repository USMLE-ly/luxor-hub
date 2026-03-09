import { cn } from "@/lib/utils";
import { ReactTyped } from "react-typed";

// --- Canvas Trail Effect ---
interface WaveNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface WaveLine {
  spring: number;
  friction: number;
  nodes: WaveNode[];
  update: (pos: { x: number; y: number }, config: typeof TRAIL_CONFIG) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const TRAIL_CONFIG = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

function createNode(): WaveNode {
  return { x: 0, y: 0, vx: 0, vy: 0 };
}

function createLine(
  spring: number,
  pos: { x: number; y: number }
): WaveLine {
  const adjustedSpring = spring + 0.1 * Math.random() - 0.05;
  const friction = TRAIL_CONFIG.friction + 0.01 * Math.random() - 0.005;
  const nodes: WaveNode[] = [];
  for (let i = 0; i < TRAIL_CONFIG.size; i++) {
    const node = createNode();
    node.x = pos.x;
    node.y = pos.y;
    nodes.push(node);
  }

  return {
    spring: adjustedSpring,
    friction,
    nodes,
    update(pos, config) {
      let e = this.spring;
      const t = this.nodes[0];
      t.vx += (pos.x - t.x) * e;
      t.vy += (pos.y - t.y) * e;
      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        if (i > 0) {
          const prev = this.nodes[i - 1];
          node.vx += (prev.x - node.x) * e;
          node.vy += (prev.y - node.y) * e;
          node.vx += prev.vx * config.dampening;
          node.vy += prev.vy * config.dampening;
        }
        node.vx *= this.friction;
        node.vy *= this.friction;
        node.x += node.vx;
        node.y += node.vy;
        e *= config.tension;
      }
    },
    draw(ctx) {
      let nx = this.nodes[0].x;
      let ny = this.nodes[0].y;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      let a: WaveNode, b: WaveNode;
      for (let i = 1; i < this.nodes.length - 2; i++) {
        a = this.nodes[i];
        b = this.nodes[i + 1];
        nx = 0.5 * (a.x + b.x);
        ny = 0.5 * (a.y + b.y);
        ctx.quadraticCurveTo(a.x, a.y, nx, ny);
      }
      a = this.nodes[this.nodes.length - 2];
      b = this.nodes[this.nodes.length - 1];
      ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
      ctx.stroke();
      ctx.closePath();
    },
  };
}

let trailCtx: CanvasRenderingContext2D | null = null;
let trailLines: WaveLine[] = [];
let trailPos = { x: 0, y: 0 };
let trailRunning = false;
let trailPhase = Math.random() * 2 * Math.PI;
const trailFrequency = 0.0015;
const trailAmplitude = 85;
const trailOffset = 285;

function getHue(): number {
  trailPhase += trailFrequency;
  return trailOffset + Math.sin(trailPhase) * trailAmplitude;
}

function initLines() {
  trailLines = [];
  for (let i = 0; i < TRAIL_CONFIG.trails; i++) {
    trailLines.push(
      createLine(0.45 + (i / TRAIL_CONFIG.trails) * 0.025, trailPos)
    );
  }
}

function renderTrail() {
  if (!trailCtx || !trailRunning) return;
  trailCtx.globalCompositeOperation = "source-over";
  trailCtx.clearRect(0, 0, trailCtx.canvas.width, trailCtx.canvas.height);
  trailCtx.globalCompositeOperation = "lighter";
  trailCtx.strokeStyle = `hsla(${Math.round(getHue())},100%,50%,0.025)`;
  trailCtx.lineWidth = 10;
  for (const line of trailLines) {
    line.update(trailPos, TRAIL_CONFIG);
    line.draw(trailCtx);
  }
  window.requestAnimationFrame(renderTrail);
}

function handleTrailMove(e: MouseEvent | TouchEvent) {
  if ("touches" in e) {
    trailPos.x = e.touches[0].pageX;
    trailPos.y = e.touches[0].pageY;
  } else {
    trailPos.x = e.clientX;
    trailPos.y = e.clientY;
  }
}

function handleFirstInteraction(e: MouseEvent | TouchEvent) {
  document.removeEventListener("mousemove", handleFirstInteraction as any);
  document.removeEventListener("touchstart", handleFirstInteraction as any);
  document.addEventListener("mousemove", handleTrailMove as any);
  document.addEventListener("touchmove", handleTrailMove as any);
  document.addEventListener(
    "touchstart",
    (ev: TouchEvent) => {
      if (ev.touches.length === 1) {
        trailPos.x = ev.touches[0].pageX;
        trailPos.y = ev.touches[0].pageY;
      }
    },
    { passive: true }
  );
  handleTrailMove(e);
  initLines();
  renderTrail();
}

function resizeTrailCanvas() {
  if (!trailCtx) return;
  trailCtx.canvas.width = window.innerWidth - 20;
  trailCtx.canvas.height = window.innerHeight;
}

export const renderCanvas = function () {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) return;
  trailCtx = canvas.getContext("2d");
  if (!trailCtx) return;
  trailRunning = true;
  document.addEventListener("mousemove", handleFirstInteraction as any);
  document.addEventListener("touchstart", handleFirstInteraction as any);
  document.body.addEventListener("orientationchange", resizeTrailCanvas);
  window.addEventListener("resize", resizeTrailCanvas);
  window.addEventListener("focus", () => {
    if (!trailRunning) {
      trailRunning = true;
      renderTrail();
    }
  });
  window.addEventListener("blur", () => {
    trailRunning = true;
  });
  resizeTrailCanvas();
};

// --- TypeWriter ---
interface TypeWriterProps {
  strings: string[];
}

const TypeWriter = ({ strings }: TypeWriterProps) => {
  return (
    <ReactTyped
      loop
      typeSpeed={80}
      backSpeed={20}
      strings={strings}
      smartBackspace
      backDelay={1000}
      loopCount={0}
      showCursor
      cursorChar="|"
    />
  );
};

// --- Shine Border ---
type TColorProp = string | string[];

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: TColorProp;
  className?: string;
  children: React.ReactNode;
}

function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "relative grid h-full w-full place-items-center rounded-3xl p-3",
        className
      )}
    >
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--border-radius": `${borderRadius}px`,
            "--shine-pulse-duration": `${duration}s`,
            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            "--background-radial-gradient": `radial-gradient(transparent,transparent, ${color instanceof Array ? color.join(",") : color},transparent,transparent)`,
          } as React.CSSProperties
        }
        className={`before:bg-shine-size before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-3xl before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:![mask-composite:exclude] before:[mask:--mask-linear-gradient] motion-safe:before:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]`}
      ></div>
      {children}
    </div>
  );
}

export { TypeWriter, ShineBorder };
