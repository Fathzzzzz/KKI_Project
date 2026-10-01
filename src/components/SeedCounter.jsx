// Counter seed besar (mono) + progress bar pencarian.
export default function SeedCounter({ value, total, n }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  const shown = Math.max(0, Math.min(value, total - 1))
  return (
    <div className="seed-counter">
      <span className="seed-counter-val">{shown.toString(2).padStart(n, '0')}</span>
      <div
        className="seed-progress"
        role="progressbar"
        aria-valuenow={shown}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className="seed-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="seed-counter-meta">coba ke-{shown + 1} / {total}</span>
    </div>
  )
}
