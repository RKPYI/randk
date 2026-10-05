import { LAST_REALM, realms, upgrades } from './config'
import type { UpgradeLevels } from './logic'

export const SAVE_KEY = 'randk-cultivation-v1'

const MAX_LEVEL = 100000

export type SaveData = {
  /** Spendable Qi. */
  qi: number
  /** Lifetime Qi. Never decreases, and is what breakthroughs and upgrade reveals check. */
  totalQi: number
  realm: number
  levels: UpgradeLevels
  /** Timestamp of the last game tick, so time spent in a hidden tab still counts as away time. */
  lastSaved: number
  hintSeen: boolean
  ascended: boolean
}

function emptyLevels(): UpgradeLevels {
  return Object.fromEntries(upgrades.map((upgrade) => [upgrade.id, 0])) as UpgradeLevels
}

export function defaultSave(): SaveData {
  return { qi: 0, totalQi: 0, realm: 0, levels: emptyLevels(), lastSaved: Date.now(), hintSeen: false, ascended: false }
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Returns a clean SaveData, or null if the stored value is unusable. Also migrates saves that predate `totalQi`. */
function sanitize(value: unknown): SaveData | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (!isNumber(raw.qi) || raw.qi < 0) return null
  if (!isNumber(raw.realm) || !Number.isInteger(raw.realm) || raw.realm < 0 || raw.realm > LAST_REALM) return null

  const storedLevels = raw.levels && typeof raw.levels === 'object' ? (raw.levels as Record<string, unknown>) : {}
  const levels = Object.fromEntries(
    upgrades.map((upgrade) => {
      const level = storedLevels[upgrade.id]
      return [upgrade.id, isNumber(level) && Number.isInteger(level) && level >= 0 ? Math.min(level, MAX_LEVEL) : 0]
    }),
  ) as UpgradeLevels

  const realm = raw.realm
  const floor = realms[realm].required
  const totalQi = Math.max(isNumber(raw.totalQi) ? raw.totalQi : 0, raw.qi, floor)
  const now = Date.now()

  return {
    qi: raw.qi,
    totalQi,
    realm,
    levels,
    lastSaved: isNumber(raw.lastSaved) ? Math.min(raw.lastSaved, now) : now,
    hintSeen: raw.hintSeen === true,
    ascended: realm === LAST_REALM,
  }
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return defaultSave()
    return sanitize(JSON.parse(raw)) ?? defaultSave()
  } catch {
    return defaultSave()
  }
}

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode, quota). The session stays playable.
  }
}

export function resetSave(): SaveData {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // Same as above: resetting the live session still works.
  }
  return defaultSave()
}