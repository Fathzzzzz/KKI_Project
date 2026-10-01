/*
 * Konvensi LFSR tunggal & final (satu-satunya sumber kebenaran untuk angka).
 * Fibonacci LFSR: geser kanan, feedback masuk MSB, output dari LSB.
 */

export const MIN_N = 3;
export const MAX_N = 16;
export const DEFAULT_N = '4';
export const DEFAULT_SEED = '1011';
export const DEFAULT_TAPS = '4,3';
export const DEFAULT_LENGTH = '20';
export const MAX_KEYSTREAM = 2048;

// Tap primitif (1-based dari MSB) -> periode maksimal 2^n - 1.
export const PRIMITIVE_TAPS = {
  3: [3, 2],
  4: [4, 3],
  5: [5, 3],
  6: [6, 5],
  7: [7, 6],
  8: [8, 6, 5, 4],
  9: [9, 5],
  10: [10, 7],
  11: [11, 9],
  12: [12, 11, 10, 4],
  13: [13, 12, 11, 8],
  14: [14, 13, 12, 2],
  15: [15, 14],
  16: [16, 14, 13, 11],
};

// Enam parameter konvensi (untuk Seksi A).
export const CONVENTIONS = [
  {
    name: 'Register size (n)',
    value: 'Jumlah bit register. Default 4, rentang 3 ≤ n ≤ 16.',
  },
  {
    name: 'Initial seed',
    value: 'String biner n-bit. Indeks 0 = MSB (kiri), indeks n−1 = LSB (kanan).',
  },
  {
    name: 'Tap positions',
    value: 'Posisi bit 1-based dari kiri (MSB = posisi 1). "4,3" = bit ke-4 & ke-3.',
  },
  {
    name: 'Shift direction',
    value: 'Kanan: tiap clock bit bergeser satu slot ke arah LSB.',
  },
  {
    name: 'Output bit',
    value: 'LSB = bit paling kanan (posisi n), diambil SEBELUM register digeser.',
  },
  {
    name: 'Feedback',
    value: 'XOR semua bit tap, masuk MSB (posisi 1) SETELAH geser.',
  },
];
