import { useEffect } from 'react'
import { motion } from 'motion/react'
import { intro, unlock } from '../audio/sounds.js'

const EASE = [0.16, 1, 0.3, 1]

// Intro ala Apple: teks muncul pelan di atas hitam (fade + blur→tajam + scale turun),
// tahan sebentar, lalu fade-out menuju situs. Klik di mana pun untuk melewatkan.
export default function Intro({ onDone }) {
  // Pad penyambutan. Browser mengunci audio sebelum gesture pertama, jadi:
  // (1) coba bunyikan saat judul muncul (bunyi bila audio sudah ter-unlock),
  // (2) bila belum, bunyikan segera setelah gesture pertama selama intro masih tampil.
  useEffect(() => {
    let played = false

    const play = () => {
      if (played) return
      if (intro()) played = true
    }

    const t = setTimeout(play, 700)

    const onFirstGesture = () => {
      unlock()
      // Beri waktu resume() settle, lalu coba sekali lagi.
      setTimeout(() => { if (!played && intro()) played = true }, 60)
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
    window.addEventListener('pointerdown', onFirstGesture)
    window.addEventListener('keydown', onFirstGesture)

    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
    }
  }, [])

  return (
    <motion.div
      className="intro"
      role="presentation"
      aria-label="Intro LFSR & Stream Cipher"
      onClick={onDone}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE } }}
    >
      <motion.p
        className="intro-kicker"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
      >
        welcome to
      </motion.p>
      <motion.h1
        className="intro-title"
        initial={{ opacity: 0, scale: 1.07, filter: 'blur(12px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.15, ease: EASE, delay: 0.65 }}
      >
        LFSR &amp; Stream Cipher
      </motion.h1>
      <motion.p
        className="intro-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.35 }}
      >
        project · kelompok 04 · kriptografi dan keamanan informasi
      </motion.p>
    </motion.div>
  )
}
