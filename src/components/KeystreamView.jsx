// Baris keystream (biru). Bit sebelum `revealed` aktif, sisanya redup.
export default function KeystreamView({ bits, revealed }) {
  return (
    <div className="keystream" aria-label="Keystream">
      {Array.from(bits).map((b, i) => {
        const revealedBit = i < revealed
        const cls = ['ksbit', b === '1' ? 'k1' : 'k0']
        if (!revealedBit) cls.push('dim')
        if (i > 0 && i % 8 === 0) cls.push('gap')
        return (
          <span key={i} className={cls.join(' ')}>
            {revealedBit ? b : ''}
          </span>
        )
      })}
    </div>
  )
}
