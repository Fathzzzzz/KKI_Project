import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useLfsr } from '../lfsr/useLfsrState.js'
import { LfsrError, isZeroSeed, isShortPeriod } from '../lfsr/validate.js'
import RegisterView from './RegisterView.jsx'
import KeystreamView from './KeystreamView.jsx'
import FeedbackFly from './FeedbackFly.jsx'
import TraceTable from './TraceTable.jsx'
import PlayPause from './controls/PlayPause.jsx'
import SpeedSlider from './controls/SpeedSlider.jsx'
import { Reveal } from './Reveal.jsx'
import { success, error } from '../audio/sounds.js'

const STEP_MS = 1500

export default function SeksiB_Generator() {
  const reduced = useReducedMotion()
  const {
    seed, n, taps, length,
    key, trace, step, playing, speed,
    setSeed, setN, setTaps, setLength,
    generate, generateFullPeriod, reset, stepForward, togglePlay, setSpeed,
  } = useLfsr()

  const [error, setError] = useState(null)
  const started = useRef(false)

  // Generate awal dari default supaya halaman langsung menampilkan demo.
  useEffect(() => {
    if (started.current) return
    started.current = true
    try { generate() } catch { /* default selalu valid */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Play loop: satu clock per STEP_MS/speed ms.
  useEffect(() => {
    if (!playing || !trace) return
    if (step >= trace.steps.length) {
      useLfsr.setState({ playing: false })
      return
    }
    const id = setTimeout(stepForward, STEP_MS / speed)
    return () => clearTimeout(id)
  }, [playing, step, speed, trace, stepForward])

  function onSubmit(e) {
    e.preventDefault()
    try {
      generate()
      setError(null)
      success()
    } catch (err) {
      if (err instanceof LfsrError) { setError(err); error() }
      else throw err
    }
  }

  function fullPeriod() {
    try {
      generateFullPeriod()
      setError(null)
      success()
    } catch (err) {
      if (err instanceof LfsrError) { setError(err); error() }
      else throw err
    }
  }

  const total = trace ? trace.steps.length : 0
  const done = step >= total
  const curState = trace ? trace.states[step] : null
  const pending = trace && !done ? trace.steps[step] : null

  const zeroSeed = key ? isZeroSeed(key.seed) : false
  const shortPeriod = key && trace?.period != null ? isShortPeriod(trace.period, key.n) : false
  const maxPeriod = key ? 2 ** key.n - 1 : 0

  return (
    <Reveal>
      <section className="card" id="generator">
      <header className="card-head">
        <span className="section-label">section b</span>
          <h2>Keystream Generator</h2>
          <p className="lede">Masukkan seed, ukuran register, dan taps, lalu generate keystream.</p>
        </header>

        <form className="form" noValidate onSubmit={onSubmit}>
          <div className="key-row four">
            <div className="field">
              <label htmlFor="g-seed">Seed</label>
              <input
                id="g-seed"
                className="mono"
                autoComplete="off"
                spellCheck="false"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                aria-invalid={error?.field === 'seed' || undefined}
                placeholder="1011"
              />
              <p className="hint">n bit biner, MSB → LSB</p>
            </div>
            <div className="field">
              <label htmlFor="g-n">Ukuran (n)</label>
              <input
                id="g-n"
                inputMode="numeric"
                autoComplete="off"
                value={n}
                onChange={(e) => setN(e.target.value)}
                aria-invalid={error?.field === 'n' || undefined}
                placeholder="4"
              />
              <p className="hint">3–16</p>
            </div>
            <div className="field">
              <label htmlFor="g-taps">Taps</label>
              <input
                id="g-taps"
                className="mono"
                autoComplete="off"
                spellCheck="false"
                value={taps}
                onChange={(e) => setTaps(e.target.value)}
                aria-invalid={error?.field === 'taps' || undefined}
                placeholder="4,3"
              />
              <p className="hint">1-based, wajib memuat n</p>
            </div>
            <div className="field">
              <label htmlFor="g-length">Panjang (bit)</label>
              <input
                id="g-length"
                inputMode="numeric"
                autoComplete="off"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                aria-invalid={error?.field === 'length' || undefined}
                placeholder="20"
              />
            </div>
          </div>

          {error && <div className="banner error" role="alert">{error.message}</div>}

          <div className="controls">
            <button className="btn primary" type="submit" data-sound="action">Generate Keystream</button>
            <button className="btn" type="button" data-sound="action" onClick={fullPeriod}>1 Periode Penuh</button>
          </div>
        </form>

        {trace && key && (
          <div className="instrument" style={{ marginTop: 20 }}>
            <RegisterView n={key.n} taps={key.taps} state={curState} stepKey={step} reduced={reduced} />
            <FeedbackFly
              taps={key.taps}
              feedback={pending ? pending.feedback : '—'}
              stepKey={step}
              reduced={reduced}
            />
            <KeystreamView bits={trace.keystream} revealed={step} />

            <div className="scope-bar">
              <p className="readout" aria-live="polite">
                {done ? (
                  <strong>Selesai.</strong>
                ) : (
                  <>
                    <strong>Clock {step + 1} dari {total}.</strong>{' '}
                    k = <span className="k-out">{pending.output}</span> ·{' '}
                    f = <span className="f-val">{pending.feedback}</span>
                  </>
                )}
              </p>
              <div className="controls">
                <PlayPause playing={playing} disabled={!trace} onToggle={togglePlay} />
                <button className="btn" type="button" disabled={step === 0} onClick={reset}>Reset</button>
                <button className="btn" type="button" disabled={done} onClick={stepForward}>Langkah +1</button>
                <SpeedSlider speed={speed} onChange={setSpeed} />
              </div>
            </div>

            <p className="period-line">
              {trace.period != null ? (
                <>
                  Periode <strong>{trace.period}</strong> bit
                  {shortPeriod && <> · <span className="warn">periode pendek (maksimal {maxPeriod})</span></>}
                </>
              ) : (
                <>Periode belum tercapai dalam {total} bit (maksimal {maxPeriod}).</>
              )}
            </p>

            {zeroSeed && (
              <div className="banner warning">State nol: LFSR macet, keystream jadi all-zero.</div>
            )}
            {shortPeriod && (
              <div className="banner warning">
                Tap non-primitif: periode {trace.period} &lt; 2ⁿ−1 = {maxPeriod}.
              </div>
            )}

            <TraceTable steps={trace.steps} taps={key.taps} n={key.n} current={step} />
          </div>
        )}
      </section>
    </Reveal>
  )
}
