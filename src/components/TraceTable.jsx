function StateBits({ bits, taps, n }) {
  return bits.map((b, i) => {
    const pos = i + 1
    const cls = ['tb', taps.includes(pos) ? 'tap' : '', pos === n ? 'output' : '']
      .filter(Boolean)
      .join(' ')
    return (
      <span key={i} className={cls}>
        {b}
      </span>
    )
  })
}

// Tabel trace per clock, collapsible. Warna mengikuti mekanisme (tap/biru, output/merah).
export default function TraceTable({ steps, taps, n, current }) {
  return (
    <details className="trace">
      <summary>Tabel trace per clock</summary>
      <div className="table-scroll">
        <table className="trace-table">
          <thead>
            <tr>
              <th scope="col" className="num">Clock</th>
              <th scope="col">State (MSB→LSB)</th>
              <th scope="col">Tap bits</th>
              <th scope="col">Feedback f</th>
              <th scope="col">Output k</th>
              <th scope="col">Next</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => (
              <tr key={i} className={i === current ? 'cur' : ''}>
                <td className="num">{i + 1}</td>
                <td><StateBits bits={s.state} taps={taps} n={n} /></td>
                <td className="tap">{s.tapBits.join('⊕')}</td>
                <td className="xor">{s.feedback}</td>
                <td className="output">{s.output}</td>
                <td>{s.next.join('')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
