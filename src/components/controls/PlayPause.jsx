export default function PlayPause({ playing, disabled, onToggle }) {
  return (
    <button
      className="btn primary"
      type="button"
      disabled={disabled}
      onClick={onToggle}
      aria-pressed={playing}
    >
      {playing ? 'Jeda' : 'Putar'}
    </button>
  )
}
