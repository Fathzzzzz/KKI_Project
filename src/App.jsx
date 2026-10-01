import { useEffect, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'motion/react'
import Intro from './components/Intro.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import Landing from './components/Landing.jsx'
import SeksiA_Konvensi from './components/SeksiA_Konvensi.jsx'
import SeksiB_Generator from './components/SeksiB_Generator.jsx'
import SeksiC_Cipher from './components/SeksiC_Cipher.jsx'
import SeksiD_SeedSearch from './components/SeksiD_SeedSearch.jsx'
import { click, unlock, transitionWhoosh } from './audio/sounds.js'

const NAV = [
  ['#tentang', 'Tentang'],
  ['#konvensi', 'Konvensi'],
  ['#generator', 'Generator'],
  ['#cipher', 'Cipher'],
  ['#seed-search', 'Seed Search'],
]

const INTRO_MS = 3600

export default function App() {
  const reduced = useReducedMotion()
  const [showIntro, setShowIntro] = useState(!reduced)

  // Auto-tutup intro setelah beberapa detik (dilewati total saat reduced motion).
  useEffect(() => {
    if (!showIntro) return
    const t = setTimeout(() => setShowIntro(false), INTRO_MS)
    return () => clearTimeout(t)
  }, [showIntro])

  // Suara: buka AudioContext saat interaksi pertama + tap lembut pada tombol/link.
  useEffect(() => {
    const onPointer = () => unlock()
    const onClick = (e) => {
      unlock()
      const el = e.target.closest('[data-sound], button, a.btn, .nav-links a')
      if (!el) return
      if (el.classList.contains('sound-toggle')) return
      if (el.hasAttribute('data-sound')) return // sudah punya bunyi sendiri
      click()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <div className="app">
      <div className="bg-field" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <AnimatePresence>
        {showIntro && <Intro onDone={() => { transitionWhoosh(); setShowIntro(false) }} />}
      </AnimatePresence>

      <nav className="nav" aria-label="Navigasi halaman">
        <div className="wrap nav-inner">
          <a className="brand" href="#landing">
            <span className="slash">//</span> lfsr·cipher
          </a>
          <div className="nav-links">
            {NAV.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </div>
          <SoundToggle />
        </div>
      </nav>

      <div className="app-content">
        <Landing />

        <main className="wrap">
          <SeksiA_Konvensi />
          <SeksiB_Generator />
          <SeksiC_Cipher />
          <SeksiD_SeedSearch />
        </main>

        <footer className="footer">
          <div className="wrap">
            Kelompok 04 · LFSR &amp; stream cipher · bit ditampilkan MSB → LSB · semua perhitungan di browser.
          </div>
        </footer>
      </div>
    </div>
  )
}
