/**
 * Decorative globe for the hero — a global-oriented replacement for the previous
 * circuit-Africa illustration. Pure SVG (no image asset) so it stays crisp and
 * inherits the brand gold→red gradient.
 *
 * The continents are drawn as stylized silhouettes and rendered through a
 * halftone dot mask, giving the same glowing "circuit" feel the Africa map had,
 * over a faint latitude/longitude wireframe sphere.
 */

// Stylized world landmasses laid across the visible sphere (not geographically
// exact — tuned to read as a globe of continents within the 400×400 viewBox).
const CONTINENTS = [
  // North America
  "M120 95 L165 90 L176 118 L152 140 L140 130 L126 152 L112 126 Z",
  // South America
  "M156 206 L184 220 L179 256 L160 300 L149 262 L152 230 Z",
  // Africa
  "M205 120 L258 120 L272 150 L255 188 L246 230 L230 286 L217 250 L210 205 L196 172 L198 145 Z",
  // Europe
  "M210 100 L246 96 L250 114 L222 119 L210 112 Z",
  // Asia
  "M266 112 L330 96 L348 128 L322 151 L300 146 L284 159 L270 135 Z",
  // Australia
  "M298 240 L334 236 L341 262 L314 277 L298 260 Z",
  // Madagascar
  "M276 236 L285 241 L280 259 L272 250 Z",
];

export function GlobeGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Stylized globe of the world"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient
          id="globeLand"
          gradientUnits="userSpaceOnUse"
          x1="60"
          y1="60"
          x2="340"
          y2="340"
        >
          <stop offset="0%" style={{ stopColor: "var(--joat-gold)" }} />
          <stop offset="55%" style={{ stopColor: "var(--joat-gold-soft)" }} />
          <stop offset="100%" style={{ stopColor: "var(--joat-red)" }} />
        </linearGradient>
        <radialGradient id="globeGlow" cx="50%" cy="44%" r="58%">
          <stop offset="0%" style={{ stopColor: "var(--joat-gold)", stopOpacity: 0.22 }} />
          <stop offset="70%" style={{ stopColor: "var(--joat-red)", stopOpacity: 0.08 }} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* halftone dots used to render the continents */}
        <pattern id="globeDots" width="7.5" height="7.5" patternUnits="userSpaceOnUse">
          <circle cx="2.2" cy="2.2" r="1.5" fill="white" />
        </pattern>
        <mask id="globeDotMask">
          <rect x="0" y="0" width="400" height="400" fill="url(#globeDots)" />
        </mask>

        <clipPath id="globeClip">
          <circle cx="200" cy="200" r="158" />
        </clipPath>
      </defs>

      {/* glow behind the sphere */}
      <circle cx="200" cy="200" r="168" fill="url(#globeGlow)" />

      {/* faint lat/long wireframe */}
      <g
        clipPath="url(#globeClip)"
        stroke="url(#globeLand)"
        strokeWidth="0.8"
        opacity="0.28"
        strokeLinecap="round"
      >
        <line x1="200" y1="42" x2="200" y2="358" />
        <ellipse cx="200" cy="200" rx="107" ry="158" />
        <ellipse cx="200" cy="200" rx="53" ry="158" />
        <line x1="42" y1="200" x2="358" y2="200" />
        <ellipse cx="200" cy="120" rx="136" ry="14" />
        <ellipse cx="200" cy="280" rx="136" ry="14" />
        <ellipse cx="200" cy="64" rx="80" ry="9" />
        <ellipse cx="200" cy="336" rx="80" ry="9" />
      </g>

      {/* continents as halftone dots, clipped to the sphere */}
      <g clipPath="url(#globeClip)">
        <g mask="url(#globeDotMask)">
          {CONTINENTS.map((d) => (
            <path key={d} d={d} fill="url(#globeLand)" />
          ))}
        </g>
      </g>

      {/* sphere outline */}
      <circle cx="200" cy="200" r="158" stroke="url(#globeLand)" strokeWidth="1.6" />

      {/* circuit node accents */}
      <g style={{ fill: "var(--joat-gold)" }}>
        <circle cx="200" cy="42" r="3.2" />
        <circle cx="200" cy="358" r="3.2" />
        <circle cx="358" cy="200" r="2.8" />
        <circle cx="42" cy="200" r="2.8" />
        <circle cx="252" cy="150" r="2.2" />
        <circle cx="150" cy="250" r="2.2" />
      </g>

      {/* floating accents */}
      <circle cx="352" cy="74" r="11" style={{ fill: "var(--joat-red)" }} opacity="0.45" />
      <circle cx="54" cy="320" r="7" style={{ fill: "var(--joat-gold)" }} opacity="0.45" />
    </svg>
  );
}
