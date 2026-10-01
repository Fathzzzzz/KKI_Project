export default function SpeedSlider({ speed, onChange }) {
  return (
    <label className="speed">
      <span>Kecepatan</span>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.5"
        value={speed}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Kecepatan animasi"
      />
      <span className="speed-val">{speed}×</span>
    </label>
  )
}
