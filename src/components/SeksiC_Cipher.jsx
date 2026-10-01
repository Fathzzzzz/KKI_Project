import { useState } from 'react'
import { useLfsr } from '../lfsr/useLfsrState.js'
import { LfsrError, parseKey } from '../lfsr/validate.js'
import { encrypt, decrypt, hexToBits } from '../lfsr/core.js'
import XorVisualizer from './XorVisualizer.jsx'
import { Reveal } from './Reveal.jsx'
import { success, error } from '../audio/sounds.js'

const BIN_RE = /^[01]+$/
const HEX_RE = /^[0-9a-fA-F]+$/
const isHex = (s) => HEX_RE.test(s) && s.length % 2 === 0

export default function SeksiC_Cipher() {
  const { seed, n, taps } = useLfsr()
  const [keyForm, setKeyForm] = useState({ seed, n, taps })
  const [plaintext, setPlaintext] = useState('A')
  const [cipherIn, setCipherIn] = useState('96')
  const [encErr, setEncErr] = useState(null)
  const [decErr, setDecErr] = useState(null)
  const [encRes, setEncRes] = useState(null)
  const [decRes, setDecRes] = useState(null)

  const kf = (name) => (e) => setKeyForm((f) => ({ ...f, [name]: e.target.value }))

  function useGeneratorKey() {
    setKeyForm({ seed, n, taps })
    setEncErr(null)
    setDecErr(null)
  }

  function onEncrypt(e) {
    e.preventDefault()
    try {
      const key = parseKey(keyForm)
      if (plaintext === '') throw new LfsrError('plaintext', 'Plaintext masih kosong.')
      setEncRes(encrypt(plaintext, key.seed, key.n, key.taps))
      setEncErr(null)
      success()
    } catch (err) {
      if (err instanceof LfsrError) { setEncErr(err); error() }
      else throw err
    }
  }

  function onDecrypt(e) {
    e.preventDefault()
    try {
      const key = parseKey(keyForm)
      const t = cipherIn.replace(/\s+/g, '')
      if (t === '') throw new LfsrError('ciphertext', 'Ciphertext masih kosong.')
      let bits
      if (isHex(t)) bits = hexToBits(t)
      else if (BIN_RE.test(t) && t.length % 8 === 0) bits = t
      else throw new LfsrError('ciphertext', 'Ciphertext harus hex (2 digit/byte) atau biner (8 bit/byte).')
      setDecRes(decrypt(bits, key.seed, key.n, key.taps))
      setDecErr(null)
      success()
    } catch (err) {
      if (err instanceof LfsrError) { setDecErr(err); error() }
      else throw err
    }
  }

  return (
    <Reveal>
      <section className="card" id="cipher">
      <header className="card-head">
        <span className="section-label">section c</span>
          <h2>Stream Cipher</h2>
          <p className="lede">Enkripsi dan dekripsi memakai keystream yang sama (XOR involutif).</p>
        </header>

        <div className="key-row">
          <div className="field">
            <label htmlFor="c-seed">Seed</label>
            <input id="c-seed" className="mono" value={keyForm.seed} onChange={kf('seed')} spellCheck="false" autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="c-n">Ukuran (n)</label>
            <input id="c-n" inputMode="numeric" value={keyForm.n} onChange={kf('n')} autoComplete="off" />
          </div>
          <div className="field">
            <label htmlFor="c-taps">Taps</label>
            <input id="c-taps" className="mono" value={keyForm.taps} onChange={kf('taps')} spellCheck="false" autoComplete="off" />
          </div>
        </div>
        <button className="btn ghost small" type="button" onClick={useGeneratorKey} style={{ marginTop: 10 }}>
          pakai nilai Section B
        </button>

        <div className="cipher-split">
          <form className="form" noValidate onSubmit={onEncrypt}>
            <h3>Enkripsi</h3>
            <div className="field">
              <label htmlFor="c-plain">Plaintext</label>
              <textarea id="c-plain" rows="2" value={plaintext} onChange={(e) => setPlaintext(e.target.value)} spellCheck="false" aria-invalid={encErr?.field === 'plaintext' || undefined} />
            </div>
            {encErr && <div className="banner error" role="alert">{encErr.message}</div>}
            <button className="btn primary" type="submit" data-sound="action">Enkripsi</button>

            {encRes && (
              <div className="result-block">
                <div>
                  <span className="result-label">Ciphertext (hex)</span>
                  <div className="result-value hex">{encRes.hex}</div>
                </div>
                <div>
                  <span className="result-label">Ciphertext (biner)</span>
                  <div className="result-value">{encRes.binary}</div>
                </div>
                <XorVisualizer
                  plaintextBits={encRes.plaintextBits}
                  keystreamBits={encRes.keystream}
                  cipherBits={encRes.cipherBits}
                />
              </div>
            )}
          </form>

          <form className="form" noValidate onSubmit={onDecrypt}>
            <h3>Dekripsi</h3>
            <div className="field">
              <label htmlFor="c-cipher">Ciphertext (hex / biner)</label>
              <textarea id="c-cipher" className="mono" rows="2" value={cipherIn} onChange={(e) => setCipherIn(e.target.value)} spellCheck="false" aria-invalid={decErr?.field === 'ciphertext' || undefined} />
            </div>
            {decErr && <div className="banner error" role="alert">{decErr.message}</div>}
            <button className="btn primary" type="submit" data-sound="action">Dekripsi</button>

            {decRes && (
              <div className="result-block">
                <div>
                  <span className="result-label">Plaintext</span>
                  <div className="result-value text">{decRes.plaintext}</div>
                </div>
                <XorVisualizer
                  plaintextBits={decRes.plaintextBits}
                  keystreamBits={decRes.keystream}
                  cipherBits={decRes.cipherBits}
                />
              </div>
            )}
          </form>
        </div>
      </section>
    </Reveal>
  )
}
