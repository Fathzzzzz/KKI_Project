import { motion, useReducedMotion } from 'motion/react'

/*
 * Scroll reveal ala Dribbble: konten muncul dari bawah (fade + naik) saat masuk
 * viewport, dan turun lagi saat keluar (once = false). Dihormati prefers-reduced-motion.
 */
const EASE = [0.22, 1, 0.36, 1]

export function Reveal({ children, className, delay = 0, y = 26, once = false }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// Wadah yang me-reveal anak-anaknya satu per satu (stagger).
export function RevealGroup({ children, className, once = false, stagger = 0.1 }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15, margin: '0px 0px -40px 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className, y = 24 }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}
