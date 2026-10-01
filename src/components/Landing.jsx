import HeroLfsr from './HeroLfsr.jsx'
import { Reveal, RevealGroup, RevealItem } from './Reveal.jsx'

const PRINCIPLES = [
  {
    id: '01',
    name: 'LFSR (Linear Feedback Shift Register)',
    body: 'Register n bit yang isinya bergeser ke kanan setiap clock. Bit baru dihitung sebagai XOR dari posisi tap, lalu masuk dari kiri (MSB).',
  },
  {
    id: '02',
    name: 'Keystream',
    body: 'Deret bit keluaran LFSR, diambil dari bit paling kanan sebelum register digeser. Dengan seed dan taps yang sama, keystream-nya selalu identik.',
  },
  {
    id: '03',
    name: 'Stream cipher (XOR)',
    body: 'Ciphertext = plaintext ⊕ keystream. XOR bersifat involutif: di-XOR lagi dengan keystream yang sama mengembalikan plaintext, jadi enkripsi dan dekripsi memakai fungsi yang sama.',
  },
  {
    id: '04',
    name: 'Seed search',
    body: 'Register n bit cuma punya 2ⁿ state. Penyerang tinggal mencoba semua seed sampai keystream-nya cocok. Itu sebabnya register kecil gampang diserang.',
  },
]

export default function Landing() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero" id="landing">
        <div className="wrap">
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="hero-overline">// tugas kelompok 04 · kriptografi dan keamanan informasi</p>
              <h1 className="hero-title">LFSR &amp; Stream Cipher</h1>
              <p className="hero-lede">
                Register geser umpan-balik linier menghasilkan deret bit yang kelihatan acak, dan
                deret itu disebut <em>keystream</em>. XOR keystream dengan pesan untuk mengenkripsi,
                XOR lagi untuk membukanya kembali. Semuanya dihitung di browser, satu clock demi satu.
              </p>
              <div className="hero-cta">
                <a className="btn primary" href="#generator">Coba langsung</a>
                <a className="btn ghost" href="#tentang">Baca prinsipnya</a>
              </div>
            </div>

            <div className="hero-visual">
              <HeroLfsr />
            </div>
          </div>

          <p className="hero-meta">
            kelompok 04 · kriptografi dan keamanan informasi · demo interaktif LFSR &amp; stream cipher ·
            fibonacci, geser kanan, output lsb
          </p>
        </div>
      </section>

      {/* ---------- Tentang & prinsip ---------- */}
      <div className="wrap">
        <Reveal>
          <section className="card" id="tentang">
            <header className="card-head">
              <h2>Kelompok, tugas, dan prinsip</h2>
              <p className="lede">Ini apa, dan konsep apa yang dipraktikkan.</p>
            </header>

            <div className="about-grid">
              <div className="about-block">
                <h3>Kelompok &amp; tugas</h3>
                <dl className="about-dl">
                  <dt>Kelompok</dt>
                  <dd>04 · mata kuliah Kriptografi dan Keamanan Informasi, Universitas Gadjah Mada.</dd>
                  <dt>Tugas</dt>
                  <dd>
                    Membangun demo interaktif LFSR &amp; stream cipher. Isinya: generate keystream dari
                    seed, ukuran register, dan taps; enkripsi dan dekripsi dengan XOR; plus demo
                    pencarian seed.
                  </dd>
                  <dt>Ruang lingkup</dt>
                  <dd>
                    Enam parameter didefinisikan secara eksplisit: ukuran register, seed awal, posisi
                    tap, arah geser, bit keluaran, dan perhitungan feedback.
                  </dd>
                </dl>
              </div>

              <div className="about-block">
                <h3>Prinsip yang dipraktikkan</h3>
                <RevealGroup className="principles" stagger={0.1}>
                  {PRINCIPLES.map((p) => (
                    <RevealItem key={p.id} className="principle-item">
                      <span className="p-num" aria-hidden="true">{p.id}</span>
                      <div>
                        <h4>{p.name}</h4>
                        <p>{p.body}</p>
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  )
}
