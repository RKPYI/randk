import { useEffect, useRef, useState } from 'react'
import { realms } from './game/config'
import './loader.css'

// The loading bar is a cultivation run: progress walks through the seven realms of the game and ends in an ascension.
// It is for show. The timeline is fixed, with one real gate (web fonts), and anyone can skip it.

const SEALS = ['凡', '氣', '基', '丹', '嬰', '神', '仙'] as const
const LINES = [
  'warming up the dev server',
  'condensing qi into components',
  'laying the foundation, one div at a time',
  'forging the golden core (backend)',
  'summoning the nascent soul',
  'turning the soul into animations',
  'ascending. welcome.',
] as const
const TRIGRAMS = ['111', '011', '101', '001', '110', '010', '100', '000']

const SEEN_KEY = 'randk-loader-seen'
const FIRST_MS = 2600 // first visit in a session
const REPEAT_MS = 900 // later visits in the same session
const HOLD_MS = 420 // pause on 100% before the curtain opens
const SKIP_AFTER_MS = 500 // ignore the very first moments so a stray key does not skip it
const FONT_WAIT_MS = 4000 // never wait on web fonts longer than this
const RING = 2 * Math.PI * 64

const clockFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

function wasSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage can be unavailable. The loader just plays in full next time.
  }
}

type Props = {
  /** True once the loader should play its exit and get out of the way. */
  done: boolean
  /** Called when the run reaches 100% (or is skipped). The parent flips `done`. */
  onFinish: () => void
}

export default function LoadingScreen({ done, onFinish }: Props) {
  const [stage, setStage] = useState(0)
  const [clock, setClock] = useState(() => clockFormat.format(new Date()))
  const [canSkip, setCanSkip] = useState(false)

  const percentRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const orbRef = useRef<SVGGElement>(null)
  const barRef = useRef<HTMLElement>(null)
  const finishRef = useRef(onFinish)

  useEffect(() => {
    finishRef.current = onFinish
  })

  // The run itself. Hot values (percent, ring, orb, bar) are written straight to the DOM; React only re-renders on a realm change.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 600 : wasSeen() ? REPEAT_MS : FIRST_MS
    const start = performance.now()
    let fontsReady = false
    let frame = 0
    let holdTimer = 0
    let finished = false
    let shown = -1

    const markReady = () => {
      fontsReady = true
    }
    const fontTimer = window.setTimeout(markReady, FONT_WAIT_MS)
    if (document.fonts) void document.fonts.ready.then(markReady)
    else markReady()
    const hintTimer = window.setTimeout(() => setCanSkip(true), 900)

    function paint(p: number) {
      if (percentRef.current) percentRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      ringRef.current?.style.setProperty('stroke-dashoffset', String(RING * (1 - p)))
      orbRef.current?.style.setProperty('--fill', p.toFixed(3))
      barRef.current?.style.setProperty('transform', `scaleX(${p})`)
      const next = Math.min(realms.length - 1, Math.floor(p * realms.length))
      if (next !== shown) {
        shown = next
        setStage(next)
      }
    }

    function complete() {
      if (finished) return
      finished = true
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      markSeen()
      finishRef.current()
    }

    function skip() {
      if (finished || performance.now() - start < SKIP_AFTER_MS) return
      cancelAnimationFrame(frame)
      window.clearTimeout(holdTimer)
      paint(1)
      complete()
    }

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      // Hold at 99% until the fonts are in, so the site never pops in with the wrong typeface.
      const p = fontsReady ? eased : Math.min(eased, 0.99)
      paint(p)
      if (p >= 1) {
        holdTimer = window.setTimeout(complete, reduced ? 80 : HOLD_MS)
        return
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(holdTimer)
      window.clearTimeout(fontTimer)
      window.clearTimeout(hintTimer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [])

  // Live Surabaya clock in the corner, for as long as the loader is on screen.
  useEffect(() => {
    if (done) return
    const timer = window.setInterval(() => setClock(clockFormat.format(new Date())), 1000)
    return () => window.clearInterval(timer)
  }, [done])

  const tone = stage >= realms.length - 1 ? ' is-ascended' : stage >= 2 ? ' is-violet' : ''

  return (
    <div className={`loader${done ? ' is-done' : ''}${tone}`} aria-hidden={done}>
      <p className="loader-sr" role="status">
        Loading portfolio
      </p>
      <div className="loader-half loader-top" />
      <div className="loader-half loader-bottom" />

      <div className="loader-stage" aria-hidden="true">
        <i className="loader-flash" key={stage} />

        <div className="loader-corner loader-tl">
          <strong>
            RANDK<span>.</span>
          </strong>
          <span>portfolio · 2026</span>
        </div>
        <div className="loader-corner loader-tr">
          <span>Surabaya, ID</span>
          <span>{clock} WIB</span>
        </div>
        <div className="loader-corner loader-bl">
          <span>
            realm {String(stage + 1).padStart(2, '0')} / {String(realms.length).padStart(2, '0')}
          </span>
        </div>
        <div className="loader-corner loader-br">
          <span className="loader-percent">
            <span ref={percentRef}>000</span>
            <small>%</small>
          </span>
        </div>

        <div className="loader-center">
          <svg className="loader-formation" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="ld-core">
                <stop offset="0" stopColor="#fff" stopOpacity=".95" />
                <stop offset=".5" stopColor="currentColor" />
                <stop offset="1" stopColor="currentColor" stopOpacity=".25" />
              </radialGradient>
              <radialGradient id="ld-glow">
                <stop offset="0" stopColor="currentColor" stopOpacity=".5" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle className="ld-glow" cx="100" cy="100" r="98" fill="url(#ld-glow)" />
            <circle className="ld-spin ld-slow" cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" opacity=".7" />
            <g className="ld-spin ld-reverse" fill="none" stroke="currentColor" strokeWidth="2" opacity=".85">
              {TRIGRAMS.map((lines, i) => (
                <g key={lines} transform={`rotate(${i * 45} 100 100)`}>
                  {lines.split('').map((bit, j) => {
                    const y = 100 - (74 + j * 5)
                    return bit === '1' ? <path key={j} d={`M94 ${y}H106`} /> : <path key={j} d={`M94 ${y}H99M101 ${y}H106`} />
                  })}
                </g>
              ))}
            </g>
            <circle cx="100" cy="100" r="64" fill="none" stroke="var(--l-line)" strokeWidth="3" />
            <circle
              ref={ringRef}
              className="ld-progress"
              cx="100"
              cy="100"
              r="64"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={RING}
              transform="rotate(-90 100 100)"
            />
            <g ref={orbRef} className="ld-orb">
              <circle cx="100" cy="100" r="34" fill="url(#ld-core)" />
              <text key={stage} className="ld-seal" x="100" y="111" textAnchor="middle" fontSize="30" fontWeight="600">
                {SEALS[stage]}
              </text>
            </g>
          </svg>

          <div className="loader-mark">
            {'RANDK'.split('').map((letter, i) => (
              <span key={i} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                {letter}
              </span>
            ))}
            <em>.</em>
          </div>

          <p className="loader-realm" key={`realm-${stage}`}>
            {realms[stage].name}
          </p>
          <p className="loader-line" key={`line-${stage}`}>
            <span>{LINES[stage]}</span>
            <i />
          </p>
          <p className={`loader-skip${canSkip ? ' is-visible' : ''}`}>tap or press any key to skip</p>
        </div>

        <span className="loader-bar">
          <i ref={barRef} />
        </span>
      </div>

      <i className="loader-seam" aria-hidden="true" />
    </div>
  )
}