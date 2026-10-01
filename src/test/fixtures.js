// Ground-truth vector (spek §4.2).
//
// CATATAN: baris ringkasan spek §4.1 menulis "Keystream = 110101111001000",
// tetapi tabel trace §4.1 dan test XOR #2 (§4.2) sama-sama menurunkan
// "110101111000100". Nilai di bawah mengikuti tabel trace (benar secara matematis).
export const VECTOR = {
  seed: '1011',
  n: 4,
  taps: [4, 3],
  keystream: '110101111000100',
  plaintext: 'A',
  plaintextBits: '01000001',
  keystream8: '11010111',
  cipherBits: '10010110',
  cipherHex: '96',
};
