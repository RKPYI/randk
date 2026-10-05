import { useCallback, useEffect, useRef, useState } from 'react'
import { BALANCE, LAST_REALM, type UpgradeId } from './config'
import { canBreakthrough, clickPower, konamiBonus, offlineGain, qiPerSecond, upgradeCost } from './logic'
import { loadSave, resetSave, saveGame, type SaveData } from './save'

export type GameView = SaveData & { perSecond: number; power: number; ready: boolean }

function toView(state: SaveData): GameView {
  return {
    ...state,
    perSecond: qiPerSecond(state.levels, state.realm),
    power: clickPower(state.levels, state.realm),
    ready: canBreakthrough(state.totalQi, state.realm),
  }
}

/** Runs once on mount: loads the save and pays out time spent away. */
function hydrate() {
  const state = loadSave()
  const away = Math.max(0, (Date.now() - state.lastSaved) / 1000)
  const gain = away > BALANCE.awayThresholdSeconds ? offlineGain(away, qiPerSecond(state.levels, state.realm)) : 0
  state.qi += gain
  state.totalQi += gain
  state.lastSaved = Date.now()
  return { state, gain, away }
}

/**
 * All hot values live in `stateRef` and are mutated in place. React only sees a copy (`view`),
 * published on user actions and at most every `hudMs` while passive income ticks.
 */
export function useCultivation(onAway?: (gain: number) => void) {
  const [initial] = useState(hydrate)
  const stateRef = useRef<SaveData>(initial.state)
  const [view, setView] = useState<GameView>(() => toView(initial.state))
  const onAwayRef = useRef(onAway)

  useEffect(() => {
    onAwayRef.current = onAway
  })

  const publish = useCallback(() => setView(toView(stateRef.current)), [])

  useEffect(() => {
    if (initial.away >= BALANCE.offlineMinSeconds && initial.gain > 0) onAwayRef.current?.(initial.gain)
  }, [initial])

  // Game loop. Uses wall-clock time, so a throttled or hidden tab is paid out as away time when it wakes up.
  useEffect(() => {
    let frame = 0
    let last = Date.now()
    let lastPublish = last
    const tick = () => {
      const now = Date.now()
      const dt = Math.max(0, (now - last) / 1000)
      last = now
      const state = stateRef.current
      state.lastSaved = now
      const passive = qiPerSecond(state.levels, state.realm)
      if (passive > 0 && dt > 0) {
        const away = dt > BALANCE.awayThresholdSeconds
        const gain = away ? offlineGain(dt, passive) : passive * dt
        state.qi += gain
        state.totalQi += gain
        if (away && dt >= BALANCE.offlineMinSeconds && gain > 0) onAwayRef.current?.(gain)
        if (now - lastPublish >= BALANCE.hudMs) {
          lastPublish = now
          publish()
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [publish])

  useEffect(() => {
    const persist = () => saveGame(stateRef.current)
    const onVisibility = () => {
      if (document.hidden) persist()
    }
    const timer = window.setInterval(persist, BALANCE.autosaveMs)
    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('pagehide', persist)
      document.removeEventListener('visibilitychange', onVisibility)
      persist()
    }
  }, [])

  const gather = useCallback((): number => {
    const state = stateRef.current
    const power = clickPower(state.levels, state.realm)
    state.qi += power
    state.totalQi += power
    state.hintSeen = true
    publish()
    return power
  }, [publish])

  const buy = useCallback(
    (id: UpgradeId): boolean => {
      const state = stateRef.current
      const cost = upgradeCost(id, state.levels[id])
      if (state.qi < cost) return false
      state.qi -= cost
      state.levels = { ...state.levels, [id]: state.levels[id] + 1 }
      publish()
      return true
    },
    [publish],
  )

  /** Returns the new realm index, or -1 if the requirement is not met. Costs nothing. */
  const breakthrough = useCallback((): number => {
    const state = stateRef.current
    if (!canBreakthrough(state.totalQi, state.realm)) return -1
    state.realm += 1
    state.ascended = state.realm === LAST_REALM
    saveGame(state)
    publish()
    return state.realm
  }, [publish])

  /** Konami reward. Returns the amount granted. */
  const grantKonami = useCallback((): number => {
    const state = stateRef.current
    const amount = konamiBonus(state.levels, state.realm)
    state.qi += amount
    state.totalQi += amount
    publish()
    return amount
  }, [publish])

  const reset = useCallback(() => {
    stateRef.current = resetSave()
    publish()
  }, [publish])

  return { view, gather, buy, breakthrough, grantKonami, reset }
}