import type { CSSProperties } from 'react'

// Overlay art is drawn on a 300 x 380 canvas that sits exactly on top of the portrait photo.
// Landmarks in that space: face centre (148, 104), eyes y 120, chin y 194, shoulders y 204 to 255, tie knot (154, 270).
// The photo background is blue, so strokes use pale colours (set per realm in game.css via `color`).

const SEAL_FONT = "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
// Silhouette of the person, used to mask art so it appears *behind* them.
const HEAD = 'M80 130 C76 70 92 28 130 14 C150 6 185 10 205 40 C218 62 218 100 214 134 C210 152 206 160 200 170 C194 182 184 194 148 200 C112 194 102 182 96 170 C90 160 84 150 80 130 Z'
const BODY = 'M100 190 L104 204 C60 216 20 232 -10 252 V390 H310 V262 C270 238 232 216 192 204 L196 190 Z'

/** Inline style for an animated element: duration, plus a transform origin (user units) when it rotates or scales. */
const anim = (seconds: number, ox?: number, oy?: number, extra: CSSProperties = {}): CSSProperties => ({
  animationDuration: `${seconds}s`,
  ...(ox === undefined ? {} : { transformOrigin: `${ox}px ${oy}px` }),
  ...extra,
})

/** Corner brackets plus a small seal in the top-left. Shared by every realm. */
function Frame({ char, solid = false }: { char: string; solid?: boolean }) {
  return (
    <g>
      <path d="M10 34 V10 H34 M266 10 H290 V34 M10 346 V370 H34 M290 346 V370 H266" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
      <rect x="16" y="16" width="26" height="26" fill={solid ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" opacity=".9" />
      <text x="29" y="35" textAnchor="middle" fontSize="17" fontWeight="600" fontFamily={SEAL_FONT} fill={solid ? '#1a1206' : 'currentColor'}>
        {char}
      </text>
    </g>
  )
}

function BehindPerson({ id }: { id: string }) {
  return (
    <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="380">
      <rect width="300" height="380" fill="#fff" />
      <path d={HEAD} fill="#000" />
      <path d={BODY} fill="#000" />
    </mask>
  )
}

/* ---------- 0. Mortal ---------- */
const DUST = [[62, 300], [244, 318], [40, 196], [262, 176], [92, 352], [226, 64], [30, 120]] as const

function Mortal() {
  return (
    <>
      <Frame char="凡" />
      <g fill="currentColor">
        {DUST.map(([x, y], i) => (
          <circle key={i} className="ov-pulse" cx={x} cy={y} r="1.6" opacity=".5" style={anim(4 + (i % 3), undefined, undefined, { animationDelay: `${-i * 0.9}s` })} />
        ))}
      </g>
    </>
  )
}

/* ---------- 1. Qi Condensation: wisps of Qi gather around the body ---------- */
const WISPS = [
  'M46 262 C24 220 70 196 44 150 C28 118 58 94 46 52',
  'M254 266 C278 224 232 200 258 154 C274 120 244 98 256 58',
  'M72 272 C54 238 88 216 70 178',
  'M230 274 C248 242 214 222 232 184',
]

function QiCondensation() {
  return (
    <>
      <defs>
        <radialGradient id="ov1-glow">
          <stop offset="0" stopColor="currentColor" stopOpacity=".75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Frame char="氣" />
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6">
        {WISPS.map((d, i) => (
          <path key={d} className="ov-flow" d={d} strokeDasharray="5 9" opacity={i < 2 ? 0.8 : 0.45} style={anim(7 + i * 1.5)} />
        ))}
      </g>
      <circle className="ov-breathe" cx="150" cy="322" r="44" fill="url(#ov1-glow)" style={anim(4, 150, 322)} />
      <circle cx="150" cy="322" r="13" fill="none" stroke="currentColor" strokeWidth="1" opacity=".7" />
    </>
  )
}

/* ---------- 2. Foundation Establishment: a bagua formation under the body ---------- */
const TRIGRAMS = ['111', '011', '101', '001', '110', '010', '100', '000']

function Foundation() {
  const cx = 150
  const cy = 330
  return (
    <>
      <Frame char="基" />
      <circle cx={cx} cy={cy} r="88" fill="currentColor" opacity=".06" />
      <g fill="none" stroke="currentColor">
        <circle cx={cx} cy={cy} r="122" strokeWidth="1.2" opacity=".8" />
        <circle cx={cx} cy={cy} r="90" strokeWidth="1" strokeDasharray="3 6" opacity=".6" />
        <g className="ov-spin" style={anim(160, cx, cy)} strokeWidth="2.4" opacity=".85">
          {TRIGRAMS.map((lines, i) => (
            <g key={lines} transform={`rotate(${i * 45} ${cx} ${cy})`}>
              {lines.split('').map((bit, j) => {
                const y = cy - (98 + j * 8)
                return bit === '1' ? <path key={j} d={`M139 ${y} H161`} /> : <path key={j} d={`M139 ${y} H147 M153 ${y} H161`} />
              })}
            </g>
          ))}
        </g>
      </g>
    </>
  )
}

/* ---------- 3. Golden Core: a golden core burns in the dantian ---------- */
const RAYS = Array.from({ length: 12 }, (_, i) => i)
const SPARKS = [[108, 262], [198, 270], [126, 236], [178, 240]] as const

function GoldenCore() {
  const cx = 152
  const cy = 312
  return (
    <>
      <defs>
        <radialGradient id="ov3-core">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset=".5" stopColor="#f5c04a" />
          <stop offset="1" stopColor="#b9770a" />
        </radialGradient>
        <radialGradient id="ov3-glow">
          <stop offset="0" stopColor="#f5c04a" stopOpacity=".8" />
          <stop offset="1" stopColor="#f5c04a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Frame char="丹" />
      <circle className="ov-breathe" cx={cx} cy={cy} r="64" fill="url(#ov3-glow)" style={anim(3.5, cx, cy)} />
      <g className="ov-spin" style={anim(50, cx, cy, { animationDirection: 'reverse' })} stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" opacity=".75">
        {RAYS.map((i) => (
          <line key={i} x1={cx} y1={cy - 46} x2={cx} y2={cy - (i % 2 ? 56 : 68)} transform={`rotate(${i * 30} ${cx} ${cy})`} />
        ))}
      </g>
      <circle className="ov-spin" cx={cx} cy={cy} r="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 6" opacity=".8" style={anim(24, cx, cy)} />
      <circle cx={cx} cy={cy} r="22" fill="url(#ov3-core)" />
      <circle cx={cx} cy={cy} r="22" fill="none" stroke="#fff7d6" strokeWidth=".8" opacity=".7" />
      <g fill="currentColor">
        {SPARKS.map(([x, y], i) => (
          <circle key={i} className="ov-twinkle" cx={x} cy={y} r="2" style={anim(2.4 + i * 0.5, undefined, undefined, { animationDelay: `${-i * 0.7}s` })} />
        ))}
      </g>
    </>
  )
}

/* ---------- 4. Nascent Soul: a tiny soul hovers beside the head ---------- */
function NascentSoul() {
  return (
    <>
      <defs>
        <radialGradient id="ov4-aura">
          <stop offset="0" stopColor="currentColor" stopOpacity=".5" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Frame char="嬰" />
      <path className="ov-flow" d="M238 95 C228 103 223 92 215 97" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="3 5" opacity=".7" style={anim(3)} />
      <g className="ov-float" style={anim(5)}>
        <circle cx="258" cy="94" r="36" fill="url(#ov4-aura)" />
        <g fill="currentColor">
          <circle cx="258" cy="76" r="9" opacity=".95" />
          <path d="M249 87 Q258 83 267 87 L270 106 Q258 111 246 106 Z" opacity=".8" />
          <path d="M243 110 Q258 118 273 110 Q269 121 258 121 Q247 121 243 110 Z" opacity=".85" />
        </g>
        <path d="M249 90 Q239 100 250 108 M267 90 Q277 100 266 108" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        <path className="ov-flow" d="M258 122 C250 136 266 148 256 166" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="4 6" opacity=".6" style={anim(4)} />
      </g>
      <g fill="currentColor">
        <circle className="ov-twinkle" cx="236" cy="62" r="1.8" style={anim(2.6)} />
        <circle className="ov-twinkle" cx="282" cy="130" r="1.5" style={anim(3.2, undefined, undefined, { animationDelay: '-1s' })} />
        <circle className="ov-twinkle" cx="240" cy="140" r="1.6" style={anim(2.9, undefined, undefined, { animationDelay: '-2s' })} />
      </g>
    </>
  )
}

/* ---------- 5. Soul Transformation: spirit echoes and a turning mandala behind the figure ---------- */
const TICKS = Array.from({ length: 36 }, (_, i) => i)

function SoulTransformation() {
  return (
    <>
      <defs>
        <BehindPerson id="ov5-mask" />
      </defs>
      <g mask="url(#ov5-mask)" fill="none" stroke="currentColor">
        <circle cx="148" cy="104" r="126" strokeWidth="1" opacity=".35" />
        <circle className="ov-spin" cx="148" cy="104" r="112" strokeWidth="1.2" strokeDasharray="8 6" opacity=".75" style={anim(70, 148, 104)} />
        <g className="ov-spin" style={anim(110, 148, 104, { animationDirection: 'reverse' })} strokeWidth="1.2" opacity=".6">
          {TICKS.map((i) => (
            <line key={i} x1="148" y1="-8" x2="148" y2={i % 3 ? -4 : 0} transform={`rotate(${i * 10} 148 104)`} />
          ))}
        </g>
        {[-62, 62].map((dx, i) => (
          <g key={dx} className="ov-pulse" transform={`translate(${dx} 0)`} style={anim(3.6, undefined, undefined, { animationDelay: `${-i * 1.8}s` })}>
            <ellipse cx="148" cy="104" rx="72" ry="102" fill="currentColor" fillOpacity=".08" strokeWidth="1.4" strokeDasharray="5 5" />
          </g>
        ))}
      </g>
      <Frame char="神" />
    </>
  )
}

/* ---------- 6. Immortal Ascension: golden halo, drifting clouds, sparkles ---------- */
const HALO_RAYS = Array.from({ length: 24 }, (_, i) => i)
const STARS = [[56, 96, 1], [246, 52, 0.8], [270, 200, 1.1], [34, 230, 0.7], [200, 24, 0.7]] as const
const STAR = 'M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z'

function Cloud({ x, y, scale = 1, opacity = 0.78, fill = '#fff', seconds, wait = 0 }: { x: number; y: number; scale?: number; opacity?: number; fill?: string; seconds: number; wait?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="ov-drift" fill={fill} opacity={opacity} style={anim(seconds, undefined, undefined, { animationDelay: `${wait}s` })}>
        <ellipse cx="0" cy="8" rx="56" ry="12" />
        <circle cx="-24" cy="0" r="14" />
        <circle cx="2" cy="-8" r="20" />
        <circle cx="30" cy="0" r="15" />
      </g>
    </g>
  )
}

function Ascended() {
  return (
    <>
      <defs>
        <BehindPerson id="ov6-mask" />
        <radialGradient id="ov6-halo">
          <stop offset=".58" stopColor="#fff2bf" stopOpacity="0" />
          <stop offset=".72" stopColor="#fff2bf" stopOpacity=".9" />
          <stop offset=".85" stopColor="#f5c04a" stopOpacity=".55" />
          <stop offset="1" stopColor="#f5c04a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g mask="url(#ov6-mask)">
        <circle cx="148" cy="104" r="124" fill="url(#ov6-halo)" />
        <g className="ov-spin" style={anim(90, 148, 104)} stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" opacity=".65">
          {HALO_RAYS.map((i) => (
            <line key={i} x1="148" y1="-26" x2="148" y2={i % 2 ? -36 : -52} transform={`rotate(${i * 15} 148 104)`} />
          ))}
        </g>
        <circle cx="148" cy="104" r="120" fill="none" stroke="currentColor" strokeWidth="1.4" opacity=".9" />
        <circle className="ov-spin" cx="148" cy="104" r="132" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" opacity=".7" style={anim(60, 148, 104, { animationDirection: 'reverse' })} />
      </g>
      <Cloud x={150} y={376} scale={1.5} opacity={0.55} fill="#ffd982" seconds={13} />
      <Cloud x={62} y={362} seconds={9} />
      <Cloud x={238} y={358} scale={0.9} seconds={11} wait={-4} />
      <g fill="currentColor">
        {STARS.map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path className="ov-twinkle" d={STAR} style={anim(2.6 + i * 0.4, undefined, undefined, { animationDelay: `${-i * 0.8}s` })} />
          </g>
        ))}
      </g>
      <Frame char="仙" solid />
    </>
  )
}

const ARTS = [Mortal, QiCondensation, Foundation, GoldenCore, NascentSoul, SoulTransformation, Ascended]

/** Decorative SVG laid over the portrait photo. Remount it (key = realm) to replay the fade-in on breakthrough. */
export default function RealmOverlay({ realm }: { realm: number }) {
  const index = Math.max(0, Math.min(realm, ARTS.length - 1))
  const Art = ARTS[index]
  return (
    <svg className={`realm-overlay ov-r${index}`} viewBox="0 0 300 380" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  )
}