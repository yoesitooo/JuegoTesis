// Efectos de sonido sintetizados con Web Audio (no hay archivos que descargar).
import { store } from './store';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (store.muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  tap() {
    tone(660, 0, 0.08, 'triangle', 0.1);
  },
  move() {
    tone(420, 0, 0.07, 'sine', 0.08);
  },
  correct() {
    tone(784, 0, 0.14, 'triangle');
    tone(988, 0.09, 0.14, 'triangle');
    tone(1319, 0.18, 0.26, 'triangle');
  },
  wrong() {
    tone(220, 0, 0.18, 'square', 0.07);
    tone(185, 0.12, 0.28, 'square', 0.07);
  },
  levelUp() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.3, 'triangle', 0.15));
  },
};

export function vibrate(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* no soportado */
  }
}
