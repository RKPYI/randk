export const realms = [
  { name: 'Mortal', required: 0, multiplier: 1, line: '' },
  { name: 'Qi Condensation', required: 1200, multiplier: 2, line: 'You can feel it now. Your parents are still not proud.' },
  { name: 'Foundation Establishment', required: 20000, multiplier: 3, line: 'The foundation holds. Even the site colors noticed.' },
  { name: 'Golden Core', required: 300000, multiplier: 5, line: 'Spirits are drifting closer.' },
  { name: 'Nascent Soul', required: 4500000, multiplier: 8, line: 'Your cursor is not quite yours anymore. Do not look.' },
  { name: 'Soul Transformation', required: 60000000, multiplier: 13, line: 'Try hovering over my name.' },
  { name: 'Immortal Ascension', required: 800000000, multiplier: 21, line: 'Somehow, this counts as a career milestone.' },
] as const

export const LAST_REALM = realms.length - 1

export const upgrades = [
  { id: 'breathing', name: 'Deep Breathing', effect: 1, unit: 'click', baseCost: 15, growth: 1.15 },
  { id: 'mat', name: 'Meditation Mat', effect: 0.5, unit: 'per second', baseCost: 50, growth: 1.15 },
  { id: 'stone', name: 'Spirit Stone', effect: 5, unit: 'per second', baseCost: 400, growth: 1.17 },
  { id: 'beast', name: 'Spirit Beast', effect: 40, unit: 'per second', baseCost: 4000, growth: 1.18 },
  { id: 'scroll', name: 'Ancient Scroll', effect: 300, unit: 'per second', baseCost: 40000, growth: 1.19 },
  { id: 'furnace', name: 'Heavenly Furnace', effect: 2500, unit: 'per second', baseCost: 500000, growth: 1.2 },
] as const

export const BALANCE = {
  offlineEfficiency: 0.5,
  offlineCapSeconds: 8 * 60 * 60,
  // A frame gap longer than this means the tab was hidden or asleep, so it is paid out like offline time.
  awayThresholdSeconds: 2,
  // Away time shorter than this is credited silently; longer shows the "while you were away" toast.
  offlineMinSeconds: 60,
  autosaveMs: 5000,
  hudMs: 100,
  tribulationMs: 1800,
  // Konami reward: whichever is larger, this many clicks or this many seconds of passive income.
  konamiClicks: 100,
  konamiSeconds: 90,
} as const

export const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'] as const

export type UpgradeId = (typeof upgrades)[number]['id']