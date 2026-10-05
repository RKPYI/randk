import { BALANCE, LAST_REALM, realms, upgrades, type UpgradeId } from './config'

export type UpgradeLevels = Record<UpgradeId, number>

export function upgradeCost(id: UpgradeId, level: number): number {
  const upgrade = upgrades.find((item) => item.id === id)
  if (!upgrade) return Number.POSITIVE_INFINITY
  return Math.ceil(upgrade.baseCost * upgrade.growth ** level)
}

function realmMultiplier(realmIndex: number): number {
  return realms[realmIndex]?.multiplier ?? 1
}

export function clickPower(levels: UpgradeLevels, realmIndex: number): number {
  const base = upgrades.reduce((total, upgrade) => (upgrade.unit === 'click' ? total + upgrade.effect * levels[upgrade.id] : total), 1)
  return base * realmMultiplier(realmIndex)
}

export function qiPerSecond(levels: UpgradeLevels, realmIndex: number): number {
  const passive = upgrades.reduce((total, upgrade) => (upgrade.unit === 'per second' ? total + upgrade.effect * levels[upgrade.id] : total), 0)
  return passive * realmMultiplier(realmIndex)
}

/** Breakthroughs gate on lifetime Qi, so spending on upgrades never moves you backwards. */
export function canBreakthrough(totalQi: number, realmIndex: number): boolean {
  return realmIndex < LAST_REALM && totalQi >= realms[realmIndex + 1].required
}

/** 0 to 1 progress through the current realm's span. */
export function progressToNext(totalQi: number, realmIndex: number): number {
  if (realmIndex >= LAST_REALM) return 1
  const from = realms[realmIndex].required
  const to = realms[realmIndex + 1].required
  return Math.min(1, Math.max(0, (totalQi - from) / (to - from)))
}

/** Reveal is sticky: it keys off lifetime Qi and owned levels, never current Qi. */
export function isRevealed(id: UpgradeId, level: number, totalQi: number): boolean {
  if (id === upgrades[0].id || level > 0) return true
  const upgrade = upgrades.find((item) => item.id === id)
  return upgrade ? totalQi >= upgrade.baseCost * 0.5 : false
}

export function offlineGain(secondsAway: number, perSecond: number): number {
  const seconds = Math.max(0, Math.min(secondsAway, BALANCE.offlineCapSeconds))
  return seconds * perSecond * BALANCE.offlineEfficiency
}

export function konamiBonus(levels: UpgradeLevels, realmIndex: number): number {
  return Math.max(clickPower(levels, realmIndex) * BALANCE.konamiClicks, qiPerSecond(levels, realmIndex) * BALANCE.konamiSeconds)
}

const UNITS = ['', 'K', 'M', 'B', 'T'] as const

function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '')
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0'
  let power = Math.max(0, Math.min(Math.floor(Math.log10(value) / 3), UNITS.length - 1))
  let scaled = value / 1000 ** power
  // 999,999 rounds to "1000.0" at K, so bump it to the next unit instead of printing "1000K".
  if (Number(trim(scaled)) >= 1000 && power < UNITS.length - 1) {
    power += 1
    scaled = value / 1000 ** power
  }
  return `${trim(scaled)}${UNITS[power]}`
}