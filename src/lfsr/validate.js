/*
 * Validasi input + edge cases (spek §7). Melempar LfsrError dengan field.
 */
import { MIN_N, MAX_N } from './constants.js';

export class LfsrError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'LfsrError';
    this.field = field;
  }
}

export function parseSize(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') throw new LfsrError('n', 'Ukuran register masih kosong.');
  if (!/^\d+$/.test(text)) {
    throw new LfsrError('n', `Ukuran register harus bilangan bulat, bukan "${text}".`);
  }
  const n = Number(text);
  if (n < MIN_N || n > MAX_N) {
    throw new LfsrError('n', `Ukuran register harus ${MIN_N}–${MAX_N} bit.`);
  }
  return n;
}

export function parseSeed(raw, n) {
  const text = String(raw ?? '').replace(/\s+/g, '');
  if (text === '') throw new LfsrError('seed', 'Seed masih kosong.');
  if (!/^[01]+$/.test(text)) {
    throw new LfsrError('seed', 'Seed hanya boleh berisi 0 dan 1.');
  }
  if (text.length !== n) {
    throw new LfsrError('seed', `Seed harus ${n} bit (sama dengan ukuran register), sekarang ${text.length} bit.`);
  }
  // Seed 0000 TIDAK ditolak — dibiarkan generate dengan catatan "state nol" (spek §7).
  return text;
}

export function parseTaps(raw, n) {
  const text = String(raw ?? '').trim();
  if (text === '') throw new LfsrError('taps', 'Taps masih kosong.');
  const taps = [];
  for (const part of text.split(/[\s,;]+/).filter(Boolean)) {
    if (!/^\d+$/.test(part)) {
      throw new LfsrError('taps', `Format taps tidak valid: "${part}". Gunakan angka dipisah koma.`);
    }
    const t = Number(part);
    if (t < 1 || t > n) throw new LfsrError('taps', `Tap ${t} di luar register (1–${n}).`);
    if (taps.includes(t)) throw new LfsrError('taps', `Tap ${t} ditulis dua kali.`);
    taps.push(t);
  }
  if (!taps.includes(n)) {
    throw new LfsrError('taps', `Taps harus memuat posisi ${n} (bit output).`);
  }
  return taps.sort((a, b) => b - a);
}

export function parseLength(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') throw new LfsrError('length', 'Panjang keystream masih kosong.');
  if (!/^\d+$/.test(text)) throw new LfsrError('length', 'Panjang keystream harus bilangan bulat.');
  const len = Number(text);
  if (len < 1) throw new LfsrError('length', 'Panjang keystream minimal 1 bit.');
  return len;
}

// Kembalikan { n, seed, taps } atau lempar LfsrError.
export function parseKey({ seed, n, taps }) {
  const nv = parseSize(n);
  return { n: nv, seed: parseSeed(seed, nv), taps: parseTaps(taps, nv) };
}

// ---------- Kondisi khusus untuk catatan (spek §7) ----------

export const isZeroSeed = (seed) => !seed.includes('1');

export const isShortPeriod = (period, n) => period !== null && period < 2 ** n - 1;
