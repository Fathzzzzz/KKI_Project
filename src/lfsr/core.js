/*
 * Inti LFSR (Fibonacci) + stream cipher. Fungsi murni, tanpa DOM.
 *
 * Konvensi (lihat constants.js):
 *   reg[0] = MSB (kiri, posisi 1) ... reg[n-1] = LSB (kanan, posisi n)
 *   output tiap clock = LSB (reg[n-1]), diambil sebelum geser
 *   feedback = XOR semua bit tap (tap 1-based -> indeks t-1)
 *   geser kanan: LSB keluar, feedback masuk MSB
 */

// generateKeystream(seedStr, n, taps, length) -> { keystream, states, steps, period }
export function generateKeystream(seedStr, n, taps, length) {
  const states = [seedStr.split('').map(Number)];
  const steps = [];
  let keystream = '';
  let period = null;
  const seen = new Map([[seedStr, 0]]);

  for (let i = 0; i < length; i++) {
    const cur = states[i];
    const output = cur[n - 1];
    const tapBits = taps.map((t) => cur[t - 1]);
    const feedback = tapBits.reduce((a, b) => a ^ b, 0);
    const next = [feedback, ...cur.slice(0, n - 1)];

    keystream += output;
    states.push(next);
    steps.push({ index: i, state: cur, output, feedback, tapBits, next });

    const s = next.join('');
    if (period === null && seen.has(s)) period = i + 1 - seen.get(s);
    if (!seen.has(s)) seen.set(s, i + 1);
  }

  return { keystream, states, steps, period };
}

// Periode tanpa harus tahu panjang sebelumnya: coba sampai 2^n - 1 clock.
export function findPeriod(seedStr, n, taps) {
  return generateKeystream(seedStr, n, taps, 2 ** n - 1).period;
}

// ---------- Konversi teks / bit / hex (spek §3.2) ----------

export function stringToBits(s) {
  let b = '';
  for (const ch of s) b += ch.charCodeAt(0).toString(2).padStart(8, '0');
  return b;
}

export function bitsToString(bits) {
  let s = '';
  for (let i = 0; i < bits.length; i += 8) {
    s += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
  }
  return s;
}

export function bitsToHex(bits) {
  let h = '';
  for (let i = 0; i < bits.length; i += 8) {
    h += parseInt(bits.slice(i, i + 8), 2).toString(16).padStart(2, '0').toUpperCase();
  }
  return h;
}

export function hexToBits(hex) {
  const clean = hex.replace(/\s+/g, '');
  let b = '';
  for (const h of clean) b += parseInt(h, 16).toString(2).padStart(4, '0');
  return b;
}

export function xorBits(a, b) {
  const len = Math.min(a.length, b.length);
  let out = '';
  for (let i = 0; i < len; i++) out += a[i] === b[i] ? '0' : '1';
  return out;
}

// Grup string bit jadi byte (dipisah spasi) untuk tampilan rapi.
export function groupBits(bits, group = 8) {
  const out = [];
  for (let i = 0; i < bits.length; i += group) out.push(bits.slice(i, i + group));
  return out.join(' ');
}

// ---------- Stream cipher (spek §3.3) ----------

export function encrypt(plaintext, seed, n, taps) {
  const P = stringToBits(plaintext);
  const { keystream: K } = generateKeystream(seed, n, taps, P.length);
  const C = xorBits(P, K);
  return {
    plaintextBits: P,
    keystream: K,
    cipherBits: C,
    binary: groupBits(C, 8),
    hex: bitsToHex(C),
  };
}

export function decrypt(cipherBits, seed, n, taps) {
  const { keystream: K } = generateKeystream(seed, n, taps, cipherBits.length);
  const P = xorBits(cipherBits, K);
  return { cipherBits, keystream: K, plaintextBits: P, plaintext: bitsToString(P) };
}

// ---------- Seed search (spek §3.4) ----------

export function searchSeed(targetBits, n, taps) {
  const results = [];
  for (let s = 0; s < 2 ** n; s++) {
    const seed = s.toString(2).padStart(n, '0');
    const { keystream: K } = generateKeystream(seed, n, taps, targetBits.length);
    const match = K.slice(0, targetBits.length) === targetBits;
    results.push({ seed, keystream: K, match });
  }
  return results;
}
