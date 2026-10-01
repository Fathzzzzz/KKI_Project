import { motion } from 'motion/react'

// Satu kotak bit register. Tap = biru, output (LSB) = merah.
export default function BitCell({ bit, pos, isTap, isOutput, stepKey, reduced }) {
  const wrapCls = ['bitcell-wrap', isTap ? 'tap' : '', isOutput ? 'output' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapCls}>
      <span className="bitcell-pos">{pos}</span>
      <motion.div className="bitcell">
        <motion.span
          key={stepKey}
          className="bitcell-val"
          initial={reduced ? false : { x: -12, opacity: 0.3 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 520, damping: 44 }}
        >
          {bit}
        </motion.span>
        {isTap && (
          <motion.span
            key={`pulse-${stepKey}`}
            className="tap-pulse"
            initial={reduced ? false : { opacity: 0.75 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        )}
      </motion.div>
    </div>
  )
}
