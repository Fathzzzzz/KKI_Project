import { describe, it, expect } from 'vitest';
import {
  generateKeystream,
  encrypt,
  decrypt,
  stringToBits,
  hexToBits,
  searchSeed,
} from '../lfsr/core.js';
import { VECTOR } from './fixtures.js';

const { seed: SEED, n: N, taps: TAPS, keystream: KEYSTREAM } = VECTOR;

describe('Keystream generation (ground truth §4.2)', () => {
  it('seed 1011, n=4, taps 4,3 -> keystream 15 bit + periode 15', () => {
    const r = generateKeystream(SEED, N, TAPS, 15);
    expect(r.keystream).toBe(KEYSTREAM);
    expect(r.period).toBe(15);
  });

  it('trace §4.1: langkah 0 = state 1011, output 1, feedback 0, next 0101', () => {
    const r = generateKeystream(SEED, N, TAPS, 15);
    expect(r.steps[0].state).toEqual([1, 0, 1, 1]);
    expect(r.steps[0].output).toBe(1);
    expect(r.steps[0].feedback).toBe(0);
    expect(r.steps[0].next).toEqual([0, 1, 0, 1]);
    expect(r.steps[14].next).toEqual([1, 0, 1, 1]); // kembali ke seed
  });

  it('first 8 bits = 11010111 (untuk enkripsi "A")', () => {
    expect(generateKeystream(SEED, N, TAPS, 8).keystream).toBe('11010111');
  });

  it('seed 0000 -> keystream all-zero, periode 1 (state nol)', () => {
    const r = generateKeystream('0000', N, TAPS, 8);
    expect(r.keystream).toBe('00000000');
    expect(r.period).toBe(1);
  });
});

describe('Enkripsi & dekripsi (§4.2)', () => {
  it('encrypt "A" -> C=10010110, hex 96', () => {
    const r = encrypt('A', SEED, N, TAPS);
    expect(r.plaintextBits).toBe('01000001');
    expect(r.keystream).toBe('11010111');
    expect(r.cipherBits).toBe('10010110');
    expect(r.hex).toBe('96');
  });

  it('decrypt hex "96" -> "A"', () => {
    const bits = hexToBits('96');
    const r = decrypt(bits, SEED, N, TAPS);
    expect(r.plaintext).toBe('A');
  });

  it('decrypt(encrypt(P)) === P (XOR involutif)', () => {
    const msg = 'LFSR 2026';
    const enc = encrypt(msg, SEED, N, TAPS);
    const dec = decrypt(enc.cipherBits, SEED, N, TAPS);
    expect(dec.plaintext).toBe(msg);
  });

  it('stringToBits("A") = 01000001', () => {
    expect(stringToBits('A')).toBe('01000001');
  });
});

describe('Seed search (§4.2)', () => {
  it('target keystream -> hanya seed 1011 yang cocok', () => {
    const results = searchSeed(KEYSTREAM, N, TAPS);
    const matches = results.filter((r) => r.match).map((r) => r.seed);
    expect(matches).toEqual(['1011']);
  });

  it('target pendek (< n bit) -> bisa >1 kandidat', () => {
    // 3 bit < n=4: bit pertama = seed dibaca dari kanan, s1 bebas -> 2 seed cocok
    const results = searchSeed('110', 4, [4, 3]);
    const matches = results.filter((r) => r.match).map((r) => r.seed);
    expect(matches.length).toBeGreaterThan(1);
    expect(matches).toContain('1011');
  });
});
