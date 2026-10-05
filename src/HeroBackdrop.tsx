import type { CSSProperties } from 'react'

// Quiet ambient layer for the hero. Pure CSS animation, no JS loop.
// Values are fixed (not random) so StrictMode and re-renders never reshuffle it.
// [left %, size px, duration s, delay s, drift px]
const MOTES = [
  [6, 3, 22, -4, 20], [14, 2, 28, -16, -14], [23, 4, 25, -9, 26], [31, 2, 31, -22, -18],
  [42, 3, 24, -12, 16], [51, 2, 29, -2, -22], [58, 4, 27, -19, 18], [66, 2, 23, -7, -12],
  [74, 3, 30, -14, 24], [81, 2, 26, -24, -16], [88, 4, 28, -5, 14], [94, 2, 24, -18, -20],
  [47, 3, 32, -27, 12], [36, 2, 26, -1, -10],
] as const

export default function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden="true">
      <div className="hb-grid" />
      <div className="hb-glow hb-glow-a" />
      <div className="hb-glow hb-glow-b" />
      {MOTES.map(([x, s, d, w, dx], i) => (
        <i
          key={i}
          className="hb-mote"
          style={{ '--x': `${x}%`, '--s': `${s}px`, '--d': `${d}s`, '--w': `${w}s`, '--dx': `${dx}px` } as CSSProperties}
        />
      ))}
    </div>
  )
}