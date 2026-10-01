import { motion } from 'motion/react'

// Feedback masuk MSB: f = s4 ⊕ s3 = <bit>. Bit hasil berkedip kuning.
export default function FeedbackFly({ taps, feedback, stepKey, reduced }) {
  return (
    <div className="feedback" aria-label="Feedback">
      <span className="feedback-label">f =</span>
      {taps.map((t, i) => (
        <span key={t} className="fbit">
          {i > 0 && <span className="xor-op">⊕</span>}s{t}
        </span>
      ))}
      <span className="xor-op">=</span>
      <motion.span
        key={stepKey}
        className="feedback-bit"
        initial={reduced ? false : { scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      >
        {feedback}
      </motion.span>
    </div>
  )
}
