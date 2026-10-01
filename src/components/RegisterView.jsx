import BitCell from './BitCell.jsx'

// Deretan kotak bit register: kiri = MSB (posisi 1) ... kanan = LSB (posisi n).
export default function RegisterView({ n, taps, state, stepKey, reduced }) {
  return (
    <div className="register" role="img" aria-label={`Register ${n} bit, state ${state.join('')}`}>
      {state.map((bit, i) => {
        const pos = i + 1
        return (
          <BitCell
            key={pos}
            bit={bit}
            pos={pos}
            isTap={taps.includes(pos)}
            isOutput={pos === n}
            stepKey={stepKey}
            reduced={reduced}
          />
        )
      })}
      <span className="register-dir" aria-hidden="true">→</span>
    </div>
  )
}
