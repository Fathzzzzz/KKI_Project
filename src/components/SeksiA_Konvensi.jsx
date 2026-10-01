import { CONVENTIONS } from '../lfsr/constants.js'
import { Reveal } from './Reveal.jsx'

// Seksi A: tabel statis 6 parameter konvensi (non-interaktif).
export default function SeksiA_Konvensi() {
  return (
    <Reveal>
      <section className="card" id="konvensi">
        <header className="card-head">
          <span className="section-label">section a</span>
          <h2>Konvensi</h2>
          <p className="lede">Enam parameter yang dipakai seragam di seluruh tool ini.</p>
        </header>
        <div className="table-scroll">
          <table className="conv-table">
            <thead>
              <tr>
                <th scope="col" className="num">#</th>
                <th scope="col">Parameter</th>
                <th scope="col">Definisi</th>
              </tr>
            </thead>
            <tbody>
              {CONVENTIONS.map((c, i) => (
                <tr key={c.name}>
                  <td className="num">{i + 1}</td>
                  <td className="conv-name">{c.name}</td>
                  <td className="conv-val">{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Reveal>
  )
}
