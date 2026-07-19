/**
 * LUXOR® Audio Experience System
 * Premium fashion audio using Web Audio API — zero dependencies.
 * 
 * AudioContext is created ONLY when a sound is first triggered.
 * Ambient pad starts after a delay to avoid blocking video autoplay.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let initialized = false;
let ambientStarted = false;

function getContext(): AudioContext {
  if (!audioCtx) {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);
    audioCtx = ctx;
  }
  return audioCtx;
}

export function initAudio() {
  if (initialized) return;
  initialized = true;
  // Do NOT create AudioContext here — defer until first sound trigger
  // This prevents blocking video autoplay on mobile browsers

  // Start ambient pad after a delay so videos can begin playing first
  setTimeout(() => {
    if (initialized && !ambientStarted) {
      playAmbientPad();
    }
  }, 5000);
}

export function disposeAudio() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    masterGain = null;
    initialized = false;
    ambientStarted = false;
  }
}

/* ── Interaction Sounds ── */

export function playClick() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
    if (!masterGain) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

export function playGoldClick() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
    if (!masterGain) return;
    [800, 1200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3 + i * 0.04);
      osc.connect(gain);
      gain.connect(masterGain!);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + 0.3);
    });
  } catch {}
}

export function playWhoosh() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
    if (!masterGain) return;
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * 200) * Math.exp(-t * 8);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    source.connect(gain);
    gain.connect(masterGain);
    source.start();
  } catch {}
}

export function playSuccess() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
    if (!masterGain) return;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(masterGain!);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + 0.5);
    });
  } catch {}
}

/* ── Ambient Pad ── */
let ambientNodes: { stop: () => void }[] = [];

function playAmbientPad() {
  try {
    const ctx = getContext();
    if (ctx.state === "suspended") ctx.resume();
    if (!masterGain) return;
    ambientStarted = true;

    const notes = [110, 146.83, 220, 293.66];
    ambientNodes = notes.map((freq) => {
      const oscs = [oscillatorWithDetune(ctx, freq, 0), oscillatorWithDetune(ctx, freq, 5)];
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2);
      oscs.forEach((o) => {
        o.connect(gain);
        o.start();
      });
      gain.connect(masterGain!);
      return {
        stop: () => {
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1);
          oscs.forEach((o) => o.stop(ctx.currentTime + 1));
        },
      };
    });
  } catch {}
}

function oscillatorWithDetune(ctx: AudioContext, freq: number, cents: number) {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  osc.detune.value = cents;
  return osc;
}

export function stopAmbient() {
  ambientNodes.forEach((n) => n.stop());
  ambientNodes = [];
  ambientStarted = false;
}
