/**
 * LUXOR® Audio Experience System
 * Premium fashion audio using Web Audio API — zero dependencies.
 * Synthesized ambient pads + interaction sounds.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let initialized = false;

function getContext(): AudioContext {
  if (!audioCtx) {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.15; // Master volume (15%)
    masterGain.connect(ctx.destination);
    audioCtx = ctx;
  }
  return audioCtx;
}

export function initAudio() {
  if (initialized) return;
  const ctx = getContext();
  if (ctx.state === "suspended") ctx.resume();
  initialized = true;

  // Start subtle ambient pad
  playAmbientPad();
}

export function disposeAudio() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    masterGain = null;
    initialized = false;
  }
}

/* ── Interaction Sounds ── */

/** Soft click for button presses */
export function playClick() {
  try {
    const ctx = getContext();
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

/** Premium click for important actions (gold buttons) */
export function playGoldClick() {
  try {
    const ctx = getContext();
    if (!masterGain) return;
    // Two-tone chime
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

/** Whoosh for page transitions */
export function playWhoosh() {
  try {
    const ctx = getContext();
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
    gain.connect(masterGain!);
    source.start();
  } catch {}
}

/** Success chime */
export function playSuccess() {
  try {
    const ctx = getContext();
    if (!masterGain) return;
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(masterGain!);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.5);
    });
  } catch {}
}

/* ── Ambient Pad ── */
let ambientNodes: { stop: () => void }[] = [];

function playAmbientPad() {
  try {
    const ctx = getContext();
    if (!masterGain) return;

    // Create a lush pad using detuned oscillators
    const notes = [110, 146.83, 220, 293.66]; // A2, D3, A3, D4 — warm, open chord
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
}
