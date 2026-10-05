import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { BALANCE, KONAMI, LAST_REALM, realms, upgrades } from './config'
import { formatNumber, isRevealed, progressToNext, upgradeCost } from './logic'
import RealmOverlay from './RealmOverlay'
import { useCultivation } from './useCultivation'
import './game.css'

type Floater = { id: number; value: string; x: number; y: number }
type Effect = 'none' | 'break' | 'ascend'
type ToastKind = 'break' | 'ascend' | 'away' | 'secret'
type Toast = { id: number; kind: ToastKind; title: string; text: string; leaving: boolean }

const TOAST_MS = 6000
// Must match .upgrade-panel width in game.css. Used to slide the portrait aside when the panel opens.
const PANEL_WIDTH = 300
const PANEL_MARGIN = 24
// Seal characters: break, immortal, stillness, secret. Decorative only, so they are hidden from screen readers.
const seals: Record<ToastKind, string> = { break: '破', ascend: '仙', away: '靜', secret: '秘' }

const particles = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: 2 + (i % 3),
  delay: -(i * 0.7),
}))
const burstRays = Array.from({ length: 24 }, (_, i) => i * 15)

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function CultivationGame() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [open, setOpen] = useState(false)
  const [channeling, setChanneling] = useState(false)
  const [effect, setEffect] = useState<Effect>('none')
  const [inView, setInView] = useState(true)
  // Clean view: hides the portrait decoration (overlay, aura rings, particles) so the photo can be seen plain.
  const [clean, setClean] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const timers = useRef(new Set<number>())
  const toastId = useRef(0)
  const effectTimer = useRef<number | null>(null)
  const channelTimer = useRef<number | null>(null)
  const floaterId = useRef(0)
  const konami = useRef<string[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
  }, [])

  const dismissToast = useCallback(
    (id: number) => {
      setToasts((items) => items.map((item) => (item.id === id ? { ...item, leaving: true } : item)))
      later(() => setToasts((items) => items.filter((item) => item.id !== id)), 220)
    },
    [later],
  )

  // Newest first, at most three on screen.
  const notify = useCallback(
    (kind: ToastKind, title: string, text: string) => {
      const id = toastId.current++
      setToasts((items) => [{ id, kind, title, text, leaving: false }, ...items.filter((item) => !item.leaving).slice(0, 2)])
      later(() => dismissToast(id), TOAST_MS)
    },
    [later, dismissToast],
  )

  const handleAway = useCallback(
    (gain: number) => notify('away', 'Welcome back', `While you were away, your spirit gathered ${formatNumber(gain)} Qi.`),
    [notify],
  )
  const { view, gather, buy, breakthrough, grantKonami, reset } = useCultivation(handleAway)

  // Clear every pending timer on unmount (also keeps StrictMode's double-mount clean).
  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((id) => window.clearTimeout(id))
      pending.clear()
      for (const ref of [effectTimer, channelTimer]) {
        if (ref.current !== null) window.clearTimeout(ref.current)
        ref.current = null
      }
    }
  }, [])

  // Realm state is exposed on <body> so day and night themes can be restyled from game.css without touching App.
  useEffect(() => {
    const names = Array.from({ length: view.realm + 1 }, (_, i) => `cult-r${i}`)
    document.body.classList.add(...names)
    return () => document.body.classList.remove(...names)
  }, [view.realm])

  // Pause decorative animation while the hero is off screen.
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // Konami code.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const buffer = konami.current
      buffer.push(event.key.length === 1 ? event.key.toLowerCase() : event.key)
      if (buffer.length > KONAMI.length) buffer.shift()
      if (buffer.length === KONAMI.length && KONAMI.every((key, i) => key === buffer[i])) {
        buffer.length = 0
        notify('secret', 'Secret technique', `+${formatNumber(grantKonami())} Qi. Please do not tell the elders.`)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [grantKonami, notify])

  const realm = realms[view.realm]
  const next = view.realm < LAST_REALM ? realms[view.realm + 1] : null
  const progress = Math.round(progressToNext(view.totalQi, view.realm) * 100)
  // The game stays hidden until the first press on the portrait (or a Konami reward), so a fresh visitor just sees the photo.
  const started = view.hintSeen || view.totalQi > 0
  const hasAura = view.realm >= 1 && !clean
  const hasParticles = view.realm >= 3 && !clean
  const hasSoulCursor = view.realm >= 4
  const hasName = view.realm >= 5

  // Soul Transformation: the hero name glows under the cursor.
  useEffect(() => {
    if (!hasName || prefersReducedMotion()) return
    const name = document.querySelector<HTMLElement>('.hero h1')
    if (!name) return
    let frame = 0
    let px = 0
    let py = 0
    const apply = () => {
      frame = 0
      const box = name.getBoundingClientRect()
      name.style.setProperty('--name-x', `${(px - box.left).toFixed(0)}px`)
      name.style.setProperty('--name-y', `${(py - box.top).toFixed(0)}px`)
    }
    const onMove = (event: PointerEvent) => {
      px = event.clientX
      py = event.clientY
      if (!frame) frame = requestAnimationFrame(apply)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
      name.style.removeProperty('--name-x')
      name.style.removeProperty('--name-y')
    }
  }, [hasName])

  // Nascent Soul: the cursor becomes a spirit orb (mouse and pen). Touch has no cursor, so taps send out a ripple instead.
  // Elements are created by hand and moved with the `translate` property, so mouse movement never re-renders React.
  useEffect(() => {
    if (!hasSoulCursor) return
    const host = rootRef.current?.closest<HTMLElement>('.site') ?? document.body
    const html = document.documentElement
    const reduced = prefersReducedMotion()
    const made = new Set<HTMLElement>()
    const make = (className: string) => {
      const el = document.createElement('div')
      el.className = className
      el.setAttribute('aria-hidden', 'true')
      host.appendChild(el)
      made.add(el)
      return el
    }
    const dot = make('soul-cursor-dot')
    const ring = make('soul-cursor-ring')
    let x = 0
    let y = 0
    let rx = 0
    let ry = 0
    let frame = 0
    let shown = false

    const draw = () => {
      frame = 0
      const ease = reduced ? 1 : 0.18
      rx += (x - rx) * ease
      ry += (y - ry) * ease
      dot.style.translate = `${x}px ${y}px`
      ring.style.translate = `${rx}px ${ry}px`
      if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1) frame = requestAnimationFrame(draw)
    }
    const show = () => {
      if (shown) return
      shown = true
      rx = x
      ry = y
      html.classList.add('soul-cursor')
      dot.classList.add('is-visible')
      ring.classList.add('is-visible')
    }
    const hide = () => {
      if (!shown) return
      shown = false
      html.classList.remove('soul-cursor')
      dot.classList.remove('is-visible')
      ring.classList.remove('is-visible')
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      x = event.clientX
      y = event.clientY
      show()
      const target = event.target
      ring.classList.toggle('is-active', target instanceof Element && target.closest('a, button, [role="button"]') !== null)
      if (!frame) frame = requestAnimationFrame(draw)
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        ring.classList.add('is-down')
        return
      }
      if (reduced) return
      const ripple = make('soul-ripple')
      ripple.style.left = `${event.clientX}px`
      ripple.style.top = `${event.clientY}px`
      ripple.addEventListener('animationend', () => {
        ripple.remove()
        made.delete(ripple)
      })
    }
    const onUp = () => ring.classList.remove('is-down')

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('blur', hide)
    html.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', hide)
      html.removeEventListener('mouseleave', hide)
      cancelAnimationFrame(frame)
      html.classList.remove('soul-cursor')
      made.forEach((el) => el.remove())
      made.clear()
    }
  }, [hasSoulCursor])

  // While the upgrade panel is open: Escape closes it, and on wider screens the portrait slides left so the panel sits beside it.
  useEffect(() => {
    const root = rootRef.current
    if (!open || !root) return
    const wide = window.matchMedia('(min-width: 621px)')
    const place = () => {
      const stage = stageRef.current
      if (!stage || !wide.matches) {
        root.style.setProperty('--panel-shift', '0px')
        return
      }
      const box = root.getBoundingClientRect()
      const left = box.left + (box.width - stage.offsetWidth) / 2
      const right = left + stage.offsetWidth
      const panelEdge = window.innerWidth - PANEL_WIDTH - PANEL_MARGIN - 16
      const copyEdge = document.querySelector('.hero-copy')?.getBoundingClientRect().right ?? 0
      const shift = clamp(right - panelEdge, 0, Math.max(0, left - copyEdge - 12))
      root.style.setProperty('--panel-shift', `${-Math.round(shift)}px`)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('keydown', onKey)
      root.style.removeProperty('--panel-shift')
    }
  }, [open])

  const doGather = (clientX?: number, clientY?: number) => {
    const power = gather()
    const box = stageRef.current?.getBoundingClientRect()
    if (!box) return
    const item: Floater = {
      id: floaterId.current++,
      value: `+${formatNumber(power)}`,
      x: clientX === undefined ? box.width / 2 : clientX - box.left,
      y: clientY === undefined ? box.height / 2 : clientY - box.top,
    }
    setFloaters((items) => [...items.slice(-11), item])
    later(() => setFloaters((items) => items.filter((floater) => floater.id !== item.id)), 900)
  }

  // Pointer input gathers on press. Keyboard and assistive tech arrive as a click with detail 0.
  const handlePortraitPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    doGather(event.clientX, event.clientY)
  }
  const handlePortraitClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) doGather()
  }

  const finishBreakthrough = () => {
    const index = breakthrough()
    if (index < 0) return
    const kind = index === LAST_REALM ? 'ascend' : 'break'
    notify(kind, realms[index].name, realms[index].line)
    setEffect(kind)
    if (effectTimer.current !== null) window.clearTimeout(effectTimer.current)
    effectTimer.current = window.setTimeout(() => {
      effectTimer.current = null
      setEffect('none')
    }, kind === 'ascend' ? 2600 : 1200)
  }

  const startChannel = () => {
    if (channelTimer.current !== null || !view.ready) return
    setChanneling(true)
    channelTimer.current = window.setTimeout(() => {
      channelTimer.current = null
      setChanneling(false)
      finishBreakthrough()
    }, BALANCE.tribulationMs)
  }
  const cancelChannel = () => {
    if (channelTimer.current !== null) window.clearTimeout(channelTimer.current)
    channelTimer.current = null
    setChanneling(false)
  }
  const isActivationKey = (event: ReactKeyboardEvent) => event.key === 'Enter' || event.key === ' '

  const rootClass = [
    'cultivation-game',
    `realm-${view.realm}`,
    hasAura && 'has-aura',
    view.realm >= 2 && !clean && 'has-aura-2',
    hasParticles && 'has-particles',
    hasSoulCursor && 'has-soul-cursor',
    channeling && 'is-channeling',
    effect !== 'none' && `fx-${effect}`,
    open && 'panel-open',
    !inView && 'is-offscreen',
  ]
    .filter(Boolean)
    .join(' ')

  const revealed = upgrades.filter((upgrade) => isRevealed(upgrade.id, view.levels[upgrade.id], view.totalQi))

  return (
    <div ref={rootRef} className={rootClass}>
      {hasParticles && (
        <div className="cultivation-particles" aria-hidden="true">
          {particles.map((p, i) => (
            <i key={i} style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s` }} />
          ))}
        </div>
      )}

      <div className="portrait-stage" ref={stageRef}>
        <button
          className="portrait-frame cultivation-portrait"
          type="button"
          onPointerDown={handlePortraitPointer}
          onClick={handlePortraitClick}
          aria-label="Gather Qi from the portrait of Rangga Danu Kusuma"
        >
          <img src="/profile.png" width="320" height="427" fetchPriority="high" draggable={false} alt="" />
          {started && !clean && <RealmOverlay key={view.realm} realm={view.realm} />}
          <span className="portrait-tag">Surabaya, ID</span>
        </button>
        {started && (
          <button className="overlay-toggle" type="button" onClick={() => setClean(!clean)}>
            {clean ? 'show overlay' : 'hide overlay'}
          </button>
        )}
        {floaters.map((floater) => (
          <span className="qi-floater" style={{ left: floater.x, top: floater.y }} key={floater.id} aria-hidden="true">
            {floater.value}
          </span>
        ))}
        {effect !== 'none' && <div className="tribulation-flash" aria-hidden="true" />}
        {effect === 'ascend' && (
          <div className="ascension-burst" aria-hidden="true">
            {burstRays.map((angle) => (
              <i key={angle} style={{ '--a': `${angle}deg` } as CSSProperties} />
            ))}
          </div>
        )}
        {toasts.length > 0 && (
          <div className="cultivation-toasts">
            {toasts.map((item) => (
              <div className={`cultivation-toast toast-${item.kind}${item.leaving ? ' is-leaving' : ''}`} key={item.id}>
                <span className="toast-seal" aria-hidden="true">
                  {seals[item.kind]}
                </span>
                <div className="toast-copy">
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
                <button className="toast-close" type="button" onClick={() => dismissToast(item.id)} aria-label="Dismiss notification">
                  ×
                </button>
                <i className="toast-timer" aria-hidden="true" style={{ animationDuration: `${TOAST_MS}ms` }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cultivation-hud">
        {started && (
          <div className="game-reveal">
        <div className="cultivation-stats">
          <span>{realm.name}</span>
          <strong>{view.ascended ? '∞ vibes' : `Qi ${formatNumber(Math.floor(view.qi))}`}</strong>
          <span>{view.ascended ? 'no limits' : `${formatNumber(view.perSecond)} / sec`}</span>
        </div>
        <div
          className="qi-progress"
          role="progressbar"
          aria-label={next ? `Progress to ${next.name}` : 'Cultivation complete'}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${progress}%` }} />
        </div>
        <small className="qi-target">
          {next ? `${formatNumber(Math.floor(view.totalQi))} of ${formatNumber(next.required)} Qi for ${next.name}` : 'Nothing left to climb.'}
        </small>
          </div>
        )}
        <p className="visual-note">
          Currently exploring
          <br />
          <strong>Luau + UI design</strong>
        </p>
        {!started && <p className="cultivation-hint">tap the portrait, it does things</p>}
        {started && view.ready && next && (
          <button
            className={`breakthrough-button${channeling ? ' is-holding' : ''}`}
            type="button"
            style={{ '--channel-ms': `${BALANCE.tribulationMs}ms` } as CSSProperties}
            aria-label={`Break through to ${next.name}. Hold to channel.`}
            onPointerDown={(event) => {
              if (event.pointerType === 'mouse' && event.button !== 0) return
              startChannel()
            }}
            onPointerUp={cancelChannel}
            onPointerLeave={cancelChannel}
            onPointerCancel={cancelChannel}
            onBlur={cancelChannel}
            onContextMenu={(event) => event.preventDefault()}
            onKeyDown={(event) => {
              if (!isActivationKey(event)) return
              event.preventDefault()
              if (!event.repeat) startChannel()
            }}
            onKeyUp={(event) => {
              if (!isActivationKey(event)) return
              event.preventDefault()
              cancelChannel()
            }}
            onClick={(event) => {
              // Real pointer clicks have detail > 0. Detail 0 is assistive tech, which cannot hold, so it breaks through at once.
              if (event.detail === 0) finishBreakthrough()
            }}
          >
            <span>{channeling ? 'Channeling…' : `Hold to break through to ${next.name}`}</span>
            <i className="channel-fill" aria-hidden="true" />
          </button>
        )}
      </div>

      {started && (
        <div className="cultivation-actions game-reveal">
          <button className="cultivation-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="cultivation-upgrades">
            Cultivation {open ? '−' : '+'}
          </button>
        </div>
      )}

      {started && open && (
        <div className="upgrade-panel" id="cultivation-upgrades">
          <div className="panel-head">
            <div>
              <h3>Cultivation</h3>
              <p className="panel-qi">
                Qi {formatNumber(Math.floor(view.qi))} · {formatNumber(view.perSecond)} / sec
              </p>
            </div>
            <button className="panel-close" type="button" onClick={() => setOpen(false)} aria-label="Close upgrades">
              ×
            </button>
          </div>
          {revealed.map((upgrade) => {
            const level = view.levels[upgrade.id]
            const cost = upgradeCost(upgrade.id, level)
            return (
              <div className="upgrade-row" key={upgrade.id}>
                <div>
                  <strong>{upgrade.name}</strong>
                  <small>
                    Lv. {level} · +{formatNumber(upgrade.effect)} Qi {upgrade.unit}
                  </small>
                </div>
                <button
                  type="button"
                  disabled={view.qi < cost}
                  onClick={() => buy(upgrade.id)}
                  aria-label={`Buy ${upgrade.name}, level ${level}, costs ${formatNumber(cost)} Qi`}
                >
                  {formatNumber(cost)}
                </button>
              </div>
            )
          })}
          {revealed.length < upgrades.length && <p className="upgrade-more">More show up as you gather.</p>}
          <button className="reset-progress" type="button" onClick={() => {
              if (!window.confirm('Reset all cultivation progress?')) return
              reset()
              setOpen(false)
              setClean(false)
            }}>
            reset progress
          </button>
        </div>
      )}

      {view.ascended && (
        <div className="ascension-card">
          <strong>You ascended.</strong>
          <span>Want to work together?</span>
          <a href="mailto:romagading@gmail.com">Email me</a>
          <a href="#contact">Go to contact</a>
        </div>
      )}

      <p className="cultivation-sr" role="status" aria-live="polite">
        {toasts[0] && !toasts[0].leaving ? `${toasts[0].title}. ${toasts[0].text}` : ''}
      </p>
    </div>
  )
}

export default CultivationGame