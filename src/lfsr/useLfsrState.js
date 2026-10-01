import { create } from 'zustand';
import {
  DEFAULT_SEED,
  DEFAULT_N,
  DEFAULT_TAPS,
  DEFAULT_LENGTH,
} from './constants.js';
import { generateKeystream } from './core.js';
import { parseKey, parseLength } from './validate.js';

/*
 * State machine langkah clock + config bersama antar seksi.
 * Config (seed/n/taps) dari Seksi B dipakai ulang oleh Seksi C & D.
 */
export const useLfsr = create((set, get) => ({
  // --- config (sumber: Seksi B) ---
  seed: DEFAULT_SEED,
  n: DEFAULT_N,
  taps: DEFAULT_TAPS,
  length: DEFAULT_LENGTH,

  // --- hasil generator ---
  key: null, // { n, seed, taps } terparse
  trace: null, // { keystream, states, steps, period }

  // --- playback ---
  step: 0,
  playing: false,
  speed: 1,

  setSeed: (seed) => set({ seed }),
  setN: (n) => set({ n }),
  setTaps: (taps) => set({ taps }),
  setLength: (length) => set({ length }),

  generate: () => {
    const { seed, n, taps, length } = get();
    const key = parseKey({ seed, n, taps });
    const len = parseLength(length);
    const trace = generateKeystream(key.seed, key.n, key.taps, len);
    set({ key, trace, step: 0, playing: false });
    return { key, trace };
  },

  // Hasilkan tepat satu periode penuh.
  generateFullPeriod: () => {
    const { seed, n, taps } = get();
    const key = parseKey({ seed, n, taps });
    const len = 2 ** key.n - 1;
    const trace = generateKeystream(key.seed, key.n, key.taps, len);
    set({ key, trace, length: String(len), step: 0, playing: false });
    return { key, trace };
  },

  reset: () => set({ step: 0, playing: false }),
  stepForward: () => {
    const { trace, step } = get();
    if (!trace) return;
    set({ step: Math.min(step + 1, trace.steps.length) });
  },
  togglePlay: () => {
    const { trace, step, playing } = get();
    if (!trace) return;
    if (!playing && step >= trace.steps.length) set({ step: 0 });
    set({ playing: !playing });
  },
  setSpeed: (speed) => set({ speed }),
}));
