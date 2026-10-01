# LFSR & Stream Cipher

Alat edukasi interaktif **LFSR (Linear Feedback Shift Register)** & stream cipher — satu halaman, tema
**Apple Liquid Glass** gelap (kaca translusen, aksen system blue, SF Pro/SF Mono). Tugas kelompok 4 (Kriptografi dan Keamanan Informasi).

## Stack

- **React 19 + Vite 8** — build & dev server.
- **Motion** (Framer Motion, package `motion`) — animasi register/geser/keystream.
- **Zustand** — state machine langkah clock + config bersama antar seksi.
- **Vitest** — unit test ground-truth vector.

## Menjalankan

```bash
npm install
npm run dev          # server pengembangan, http://localhost:5173
```

Build produksi:

```bash
npm run build        # hasil ke dist/
npm run preview      # menyajikan hasil build
```

`base: './'` di `vite.config.js`, jadi `dist/` bisa dibuka langsung dari `file://` atau subfolder
GitHub Pages.

## Tes

```bash
npm test             # vitest run (src/test/core.test.js)
```

## Struktur

```
src/
  main.jsx               bootstrap React
  App.jsx                nav sticky + landing + 4 seksi + footer
  styles/global.css      tema Liquid Glass gelap, token warna semantik, SF Pro/SF Mono
  lfsr/
    constants.js         6 konvensi + tabel tap primitif
    core.js              generateKeystream, enkripsi/dekripsi, searchSeed (murni, tanpa DOM)
    validate.js          validasi + edge cases (LfsrError)
    useLfsrState.js      state machine (Zustand)
  components/
    Landing.jsx          hero + tentang/kelompok/tugas + prinsip
    HeroLfsr.jsx         instr. LFSR berjalan otomatis (animasi loop)
    SeksiA_Konvensi.jsx  tabel 6 parameter (statis)
    SeksiB_Generator.jsx generator + register animasi + trace
    SeksiC_Cipher.jsx    enkripsi & dekripsi + visualisasi XOR 3 baris
    SeksiD_SeedSearch.jsx brute-force seed + counter + info 2ⁿ
    RegisterView.jsx     deretan kotak bit (kiri=MSB, kanan=LSB)
    BitCell.jsx          1 kotak bit (motion, tap=biru, output=merah)
    FeedbackFly.jsx      feedback f = s4 ⊕ s3 = bit (kuning)
    KeystreamView.jsx    baris keystream (biru)
    XorVisualizer.jsx    3 baris P/K/C (hijau/biru/indigo)
    TraceTable.jsx       tabel trace per clock (collapsible)
    SeedCounter.jsx      counter 0000→1111 + progress
    controls/            PlayPause, SpeedSlider
  test/
    core.test.js         test vector ground-truth
    fixtures.js
```

## Konvensi LFSR (Fibonacci)

- Register n bit (3 ≤ n ≤ 16), `reg[0]` = MSB (kiri, posisi 1) … `reg[n-1]` = LSB (kanan, posisi n).
- Seed dibaca kiri → kanan (MSB → LSB). Seed `0000` dibiarkan generate dengan catatan "state nol".
- Tap **1-based dari kiri** (MSB = posisi 1). `4,3` = bit ke-4 & ke-3 = polinomial x⁴ + x³ + 1.
- **Geser kanan**: tiap clock bit pindah satu slot ke arah LSB.
- **Output** = LSB (posisi n), diambil *sebelum* geser.
- **Feedback** f = XOR semua bit tap, masuk MSB *setelah* geser.
- Enkripsi: karakter ASCII → 8 bit, C = P ⊕ K (hex). Dekripsi: P = C ⊕ K.

## Ground-truth (spek §4)

| Test | Input | Output |
|---|---|---|
| Keystream | seed `1011`, n=4, taps `4,3` | `110101111000100` (periode 15) |
| Enkripsi | `"A"` + config di atas | P=`01000001`, K=`11010111`, C=`10010110` = hex `96` |
| Dekripsi | `96` + config sama | `"A"` |
| Seed search | target `110101111000100` | seed `1011` (percobaan ke-12 dari 16) |

> ⚠️ Catatan konsistensi: baris ringkasan spek menulis keystream `110101111001000`, tetapi tabel
> trace spek (§4.1) dan test XOR (§4.2 #2) sama-sama menurunkan `110101111000100`. Nilai yang
> dipakai di sini mengikuti tabel trace (benar secara matematis) — verifikasi di `src/test/core.test.js`.
