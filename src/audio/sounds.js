/*
 * Mesin suara sintesis (Web Audio API). Semua bunyi di-generate, bukan file,
 * supaya jalan offline dan bebas hak cipta. Karakternya meniru nuansa UI Apple
 * (tap, ding, thud, whoosh, pad) dengan sinus murni + envelope lembut.
 *
 * Penting: browser mengunci audio sampai ada gesture pengguna (kebijakan
 * autoplay). `unlock()` dipanggil pada pointerdown/keydown pertama. Sebelum itu
 * semua fungsi bunyi no-op (return false) supaya tidak ada bunyi "telat".
 */

const STORAGE_KEY = 'kki-sound'

let ctx = null
let master = null
let unlocked = false
let muted = false
try { muted = localStorage.getItem(STORAGE_KEY) === 'off' } catch { /* private mode */ }

const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn(muted))
}

export function getMuted() { return muted }

export function setMuted(m) {
  muted = !!m
  try { localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on') } catch { /* ignore */ }
  emit()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function ensureCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) {
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
  }
  return ctx
}

// Panggil pada gesture pertama (pointerdown/keydown). Setelah ini semua bunyi aktif.
export function unlock() {
  const c = ensureCtx()
  if (!c) return
  unlocked = true
  if (c.state === 'suspended') c.resume()
}

// Bunyi apa pun hanya jalan setelah unlock; return true bila benar-benar dijadwalkan.
function ready() {
  if (muted || !unlocked) return false
  const c = ensureCtx()
  if (!c || c.state !== 'running') return false
  return true
}

function tone({ freq = 600, freqEnd, type = 'sine', dur = 0.15, gain = 0.1, delay = 0, attack = 0.008 }) {
  if (!ready()) return false
  const c = ensureCtx()
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(master || c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
  return true
}

// Pad hangat: sinus murni + lowpass lembut + attack lambat. Tanpa parsial metalik.
function pad({ freq, gain = 0.06, attack = 0.8, dur = 3.0, delay = 0, detune = 0 }) {
  if (!ready()) return false
  const c = ensureCtx()
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t0)
  if (detune) osc.detune.setValueAtTime(detune, t0)
  const filter = c.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(1400, t0)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(filter)
  filter.connect(g)
  g.connect(master || c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.1)
  return true
}

// Chime lembut untuk sukses: dua nada naik dengan parsial sangat rendah.
function chime(freq, { gain = 0.07, dur = 0.6, delay = 0 } = {}) {
  if (!ready()) return false
  const c = ensureCtx()
  const t0 = c.currentTime + delay
  const partials = [
    [1, 1],
    [2, 0.18],
  ]
  partials.forEach(([ratio, amp]) => {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq * ratio, t0)
    const a = gain * amp
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(a, t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * (1 / ratio))
    osc.connect(g)
    g.connect(master || c.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.1)
  })
  return true
}

// Sapuan noise terfilter (whoosh) untuk transisi.
function whoosh({ up = true, dur = 0.5, gain = 0.05 } = {}) {
  if (!ready()) return false
  const c = ensureCtx()
  const t0 = c.currentTime
  const len = Math.floor(c.sampleRate * dur)
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.setValueAtTime(0.8, t0)
  const f0 = up ? 300 : 1800
  const f1 = up ? 1800 : 300
  filter.frequency.setValueAtTime(f0, t0)
  filter.frequency.exponentialRampToValueAtTime(f1, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + dur * 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(master || c.destination)
  src.start(t0)
  src.stop(t0 + dur)
  return true
}

/* ---------- Bunyi publik ---------- */

// Penyambutan intro: pad akord C mayor terbuka (C4-G4-E4-C5) yang mengembang
// pelan dan hangat, bukan bel. Return true bila benar-benar berbunyi.
export function intro() {
  pad({ freq: 261.63, gain: 0.085, attack: 1.0, dur: 3.2 })              // C4
  pad({ freq: 392.00, gain: 0.06, attack: 1.2, dur: 3.4, delay: 0.14 })   // G4
  pad({ freq: 329.63, gain: 0.05, attack: 1.4, dur: 3.6, delay: 0.26 })   // E4
  pad({ freq: 523.25, gain: 0.03, attack: 1.6, dur: 3.8, delay: 0.36 })   // C5
  return true
}

// Tap permukaan (tombol/link): "pop" lembut, nada turun cepat.
export function click() {
  tone({ freq: 520, freqEnd: 300, type: 'sine', dur: 0.07, gain: 0.05 })
}

// Sukses: dua chime naik (A5 -> D6), lembut.
export function success() {
  chime(880, { gain: 0.07, dur: 0.55 })
  chime(1174.66, { gain: 0.07, dur: 0.7, delay: 0.09 })
}

// Error: thud rendah lembut.
export function error() {
  tone({ freq: 196, freqEnd: 140, type: 'sine', dur: 0.22, gain: 0.08 })
  tone({ freq: 147, type: 'sine', dur: 0.25, gain: 0.05, delay: 0.02 })
}

// Transisi (intro -> situs): whoosh turun.
export function transitionWhoosh() { whoosh({ up: false }) }
