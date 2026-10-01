import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { searchSeed } from '../lfsr/core.js'
import { LfsrError, parseSize, parseTaps } from '../lfsr/validate.js'
import SeedCounter from './SeedCounter.jsx'
import { Reveal } from './Reveal.jsx'
import { success, error } from '../audio/sounds.js'

const SCALE = [
  ['4 bit', '15'],
  ['8 bit', '255'],
  ['16 bit', '65.535'],
  ['32 bit', '4.294.967.295'],
]

export default function SeksiD_SeedSearch() {
  const reduced = useReducedMotion()
  const [target, setTarget] = useState('110101111000100')
  const [n, setN] = useState('4')
  const [taps, setTaps] = useState('4,3')
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [revealed, setRevealed] = useState(0)
  const [matchIndex, setMatchIndex] = useState(null)

  function onSearch(e) {
    e.preventDefault()
    try {
      const nv = parseSize(n)
      const tapsArr = parseTaps(taps, nv)
      const t = target.replace(/\s+/g, '')
      if (t === '') throw new LfsrError('target', 'Target masih kosong.')
      if (!/^[01]+$/.test(t)) throw new LfsrError('target', 'Target harus biner (0 dan 1).')
      setResults(searchSeed(t, nv, tapsArr))
      setError(null)
    } catch (err) {
      if (err instanceof LfsrError) { setError(err); error() }
      else throw err
    }
  }

  useEffect(() => {
    if (!results) return
    const mIdx = results.findIndex((r) => r.match)
    setMatchIndex(mIdx)
    const instant = reduced || results.length > 256
    if (instant) {
      setRevealed(mIdx === -1 ? results.length : mIdx + 1)
      if (mIdx >= 0) success()
      return
    }
    setRevealed(0)
    let i = 0
    let dingTimer = null
    const delay = Math.max(24, Math.min(90, 3000 / results.length))
    if (mIdx >= 0) {
      // Ding tepat saat tile yang cocok muncul.
      dingTimer = setTimeout(() => success(), mIdx * delay + 280)
    }
    const timer = setInterval(() => {
      i += 1
      setRevealed(i)
      if (i > mIdx) clearInterval(timer)
    }, delay)
    return () => {
      clearInterval(timer)
      if (dingTimer) clearTimeout(dingTimer)
    }
  }, [results, reduced])

  const showGrid = results && results.length <= 256
  const matches = results ? results.filter((r) => r.match) : []
  const resultN = results ? Math.round(Math.log2(results.length)) : 4

  return (
    <Reveal>
      <section className="card" id="seed-search">
      <header className="card-head">
        <span className="section-label">section d</span>
          <h2>Seed Search</h2>
          <p className="lede">
            Penyerang tahu algoritma &amp; taps, menebak awal pesan untuk memulihkan keystream, lalu
            mencoba semua seed. Register n bit hanya punya 2ⁿ kemungkinan isi.
          </p>
        </header>

        <form className="form" noValidate onSubmit={onSearch}>
          <div className="key-row">
            <div className="field">
              <label htmlFor="s-target">Target keystream</label>
              <input
                id="s-target"
                className="mono"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                aria-invalid={error?.field === 'target' || undefined}
                placeholder="110101111000100"
                spellCheck="false"
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor="s-n">Ukuran (n)</label>
              <input
                id="s-n"
                inputMode="numeric"
                value={n}
                onChange={(e) => setN(e.target.value)}
                aria-invalid={error?.field === 'n' || undefined}
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor="s-taps">Taps</label>
              <input
                id="s-taps"
                className="mono"
                value={taps}
                onChange={(e) => setTaps(e.target.value)}
                aria-invalid={error?.field === 'taps' || undefined}
                spellCheck="false"
                autoComplete="off"
              />
            </div>
          </div>
          {error && <div className="banner error" role="alert">{error.message}</div>}
          <button className="btn primary" type="submit" data-sound="action">Cari Seed</button>
        </form>

        {results && (
          <div className="instrument" style={{ marginTop: 20 }}>
            <SeedCounter value={revealed - 1} total={results.length} n={resultN} />

            {showGrid && (
              <div className="seed-grid">
                {results.slice(0, revealed).map((r, i) => (
                  <div key={i} className={`seed-tile ${r.match ? 'match' : 'miss'}`}>
                    <span className="seed">{r.seed}</span>
                    <span className="st">{r.match ? '✓ cocok' : '✗ beda'}</span>
                  </div>
                ))}
              </div>
            )}

            {matchIndex != null && revealed > matchIndex && matches.length > 0 && (
              <div className="banner info" role="status">
                {matches.length === 1
                  ? `Ditemukan: seed ${matches[0].seed} (percobaan ke-${matchIndex + 1} dari ${results.length}).`
                  : `${matches.length} seed cocok. Tambah panjang target untuk mempersempit.`}
              </div>
            )}
            {matchIndex === -1 && revealed >= results.length && (
              <div className="banner warning">Tidak ada seed yang cocok. Periksa target &amp; taps.</div>
            )}
          </div>
        )}

        <div className="scale">
          <h3>Kenapa register kecil berbahaya</h3>
          <div className="table-scroll">
            <table className="scale-table">
              <thead>
                <tr>
                  <th scope="col">Ukuran register</th>
                  <th scope="col" className="num">Seed yang harus dicoba (2ⁿ)</th>
                </tr>
              </thead>
              <tbody>
                {SCALE.map(([size, count]) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td className="num">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ marginTop: 8, maxWidth: '70ch' }}>
            LFSR tetap lemah karena linear: Berlekamp–Massey dapat menyusun ulang LFSR n bit hanya
            dari 2n bit keystream. Stream cipher modern menambah komponen non-linear.
          </p>
        </div>
      </section>
    </Reveal>
  )
}
