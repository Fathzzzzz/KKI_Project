import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { generateKeystream } from '../lfsr/core.js'
import RegisterView from './RegisterView.jsx'
import FeedbackFly from './FeedbackFly.jsx'
import KeystreamView from './KeystreamView.jsx'

const HERO_SEED = '1011'
const HERO_N = 4
const HERO_TAPS = [4, 3]

/*
 * Instrumen yang berjalan sendiri di hero: register LFSR nyata yang berputar
 * satu periode penuh lalu mengulang. Ini produknya, jadi ditampilkan hidup.
 */
export default function HeroLfsr() {
  const reduced = useReducedMotion()
  const [data] = useState(() => generateKeystream(HERO_SEED, HERO_N, HERO_TAPS, 15))
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced) {
      setStep(data.steps.length)
      return
    }
    const id = setInterval(() => {
      setStep((s) => (s + 1) % (data.steps.length + 1))
    }, 600)
    return () => clearInterval(id)
  }, [reduced, data])

  const total = data.steps.length
  const done = step >= total
  const curState = done ? data.states[0] : data.states[step]
  const pending = done ? data.steps[0] : data.steps[step]

  return (
    <div className="hero-instrument" aria-label="Demo LFSR berjalan otomatis">
      <div className="hero-instrument-head">
        <span className="live-dot" aria-hidden="true" />
        <span>live · seed {HERO_SEED} · taps {HERO_TAPS.join(',')} · n={HERO_N}</span>
      </div>

      <RegisterView n={HERO_N} taps={HERO_TAPS} state={curState} stepKey={step} reduced={reduced} />
      <FeedbackFly taps={HERO_TAPS} feedback={pending.feedback} stepKey={step} reduced={reduced} />
      <KeystreamView bits={data.keystream} revealed={done ? total : step} />

      <div className="hero-instrument-foot">
        <span>keystream {total} bit</span>
        <span className="hero-instrument-foot-right">periode {data.period} · 2⁴−1</span>
      </div>
    </div>
  )
}
