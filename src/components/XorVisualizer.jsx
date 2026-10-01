function XorRow({ label, tone, bits }) {
  return (
    <div className={`xor-row ${tone}`}>
      <span className={`xor-label ${tone}`}>{label}</span>
      <span className="xor-bits">
        {bits.split('').map((b, i) => (
          <span key={i} className={`xbit ${b === '0' ? 'zero' : ''}`}>
            {b}
          </span>
        ))}
      </span>
    </div>
  )
}

// Tiga baris sejajar: P (hijau), K (biru), C (ungu). Diproses per byte (8 bit).
export default function XorVisualizer({ plaintextBits, keystreamBits, cipherBits }) {
  const byteCount = Math.ceil(plaintextBits.length / 8)
  return (
    <div className="xor-viz">
      {Array.from({ length: byteCount }, (_, i) => {
        const p = plaintextBits.slice(i * 8, i * 8 + 8)
        const k = keystreamBits.slice(i * 8, i * 8 + 8)
        const c = cipherBits.slice(i * 8, i * 8 + 8)
        return (
          <div className="xor-block" key={i}>
            <XorRow label="P" tone="plaintext" bits={p} />
            <XorRow label="K" tone="keystream" bits={k} />
            <XorRow label="C" tone="result" bits={c} />
          </div>
        )
      })}
    </div>
  )
}
