const SIZE = 480
const CENTER = SIZE / 2
const RADIUS = 210

interface City {
	id: string
	name: string
	x: number
	y: number
	hub?: boolean
}

const CITIES: City[] = [
	{ id: 'korhogo', name: 'Korhogo', x: 200, y: 128 },
	{ id: 'bouake', name: 'Bouaké', x: 232, y: 190, hub: true },
	{ id: 'yamoussoukro', name: 'Yamoussoukro', x: 214, y: 240 },
	{ id: 'daloa', name: 'Daloa', x: 150, y: 258 },
	{ id: 'abidjan', name: 'Abidjan', x: 256, y: 320, hub: true },
	{ id: 'san-pedro', name: 'San-Pédro', x: 170, y: 340, hub: true },
]

// Flows between cities — the "transactions" (objects reunited with their owners).
const FLOWS: [string, string][] = [
	['abidjan', 'yamoussoukro'],
	['abidjan', 'san-pedro'],
	['abidjan', 'bouake'],
	['bouake', 'korhogo'],
	['yamoussoukro', 'daloa'],
]

// Rough, stylised landmass silhouette the dot texture is clipped to —
// not a geographically accurate map, just enough to read as "a territory".
const LANDMASS: [number, number][] = [
	[200, 90],
	[260, 100],
	[310, 130],
	[340, 180],
	[350, 240],
	[335, 300],
	[300, 345],
	[250, 370],
	[190, 365],
	[140, 340],
	[105, 290],
	[95, 230],
	[105, 170],
	[140, 120],
]

function pointInPolygon(x: number, y: number, polygon: [number, number][]) {
	let inside = false
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const [xi, yi] = polygon[i]
		const [xj, yj] = polygon[j]
		const intersects =
			yi > y !== yj > y &&
			x < ((xj - xi) * (y - yi)) / (yj - yi + Number.EPSILON) + xi
		if (intersects) inside = !inside
	}
	return inside
}

// Deterministic PRNG (mulberry32) so the dot field is identical between
// server and client renders — no hydration mismatch from Math.random().
function mulberry32(seed: number) {
	return function random() {
		seed |= 0
		seed = (seed + 0x6d2b79f5) | 0
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

function generateDots() {
	const random = mulberry32(1789)
	const dots: { x: number; y: number; r: number; o: number }[] = []
	const step = 13

	for (let x = 60; x <= SIZE - 60; x += step) {
		for (let y = 60; y <= SIZE - 60; y += step) {
			const jitterX = x + (random() - 0.5) * 5
			const jitterY = y + (random() - 0.5) * 5
			const distFromCenter = Math.hypot(jitterX - CENTER, jitterY - CENTER)
			if (distFromCenter > RADIUS - 8) continue
			if (!pointInPolygon(jitterX, jitterY, LANDMASS)) continue

			dots.push({
				x: jitterX,
				y: jitterY,
				r: 1 + random() * 0.9,
				o: 0.25 + random() * 0.45,
			})
		}
	}
	return dots
}

const DOTS = generateDots()

function arcPath(from: City, to: City, bow = 0.22) {
	const mx = (from.x + to.x) / 2
	const my = (from.y + to.y) / 2
	const dx = to.x - from.x
	const dy = to.y - from.y
	const len = Math.hypot(dx, dy) || 1
	// Perpendicular to the chord, oriented away from the globe's center so
	// the arc bows outward like a flight path over a sphere.
	const nx = -dy / len
	const ny = dx / len
	const towardCenter = (mx - CENTER) * nx + (my - CENTER) * ny
	const sign = towardCenter >= 0 ? 1 : -1

	const cx = mx + sign * nx * len * bow
	const cy = my + sign * ny * len * bow

	return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
}

const HUB_COLOR = 'fill-accent-orange'
const NODE_COLOR = 'fill-primary-green'

export function HeroGlobe() {
	const cityById = new Map(CITIES.map(city => [city.id, city]))

	return (
		<div
			aria-hidden
			className="animate-scale-in pointer-events-none absolute top-1/2 -right-32 hidden h-140 w-140 -translate-y-1/2 xl:block"
		>
			<svg
				viewBox={`0 0 ${SIZE} ${SIZE}`}
				className="h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)]"
			>
				<defs>
					<radialGradient id="globe-base" cx="38%" cy="32%" r="75%">
						<stop offset="0%" stopColor="var(--background)" />
						<stop offset="100%" stopColor="var(--muted)" />
					</radialGradient>
					<radialGradient id="globe-shade" cx="32%" cy="26%" r="70%">
						<stop offset="0%" stopColor="white" stopOpacity="0.5" />
						<stop offset="55%" stopColor="white" stopOpacity="0" />
						<stop offset="100%" stopColor="black" stopOpacity="0.06" />
					</radialGradient>
					<clipPath id="globe-clip">
						<circle cx={CENTER} cy={CENTER} r={RADIUS} />
					</clipPath>
					<filter
						id="globe-glow"
						x="-100%"
						y="-100%"
						width="300%"
						height="300%"
					>
						<feGaussianBlur stdDeviation="2.4" />
					</filter>
				</defs>

				<circle
					cx={CENTER}
					cy={CENTER}
					r={RADIUS}
					fill="url(#globe-base)"
					stroke="var(--border)"
				/>

				<g clipPath="url(#globe-clip)">
					{DOTS.map((dot, i) => (
						<circle
							key={i}
							cx={dot.x}
							cy={dot.y}
							r={dot.r}
							className="fill-primary-green"
							opacity={dot.o}
						/>
					))}

					{FLOWS.map(([fromId, toId], i) => {
						const from = cityById.get(fromId)
						const to = cityById.get(toId)
						if (!from || !to) return null
						const d = arcPath(from, to)
						const pathId = `flow-path-${i}`

						return (
							<g key={pathId}>
								<path
									id={pathId}
									d={d}
									fill="none"
									className="stroke-primary-green"
									strokeWidth={1}
									strokeOpacity={0.2}
								/>
								<path
									d={d}
									fill="none"
									className="stroke-accent-orange animate-flow-dash"
									strokeWidth={1.25}
									strokeOpacity={0.5}
									strokeDasharray="1 7"
									style={{ animationDelay: `${i * 0.2}s` }}
								/>
								<circle
									r={2.6}
									className="fill-accent-orange"
									filter="url(#globe-glow)"
								>
									<animateMotion
										dur={`${3 + i * 0.4}s`}
										begin={`${i * 0.6}s`}
										repeatCount="indefinite"
									>
										<mpath href={`#${pathId}`} />
									</animateMotion>
								</circle>
							</g>
						)
					})}

					{CITIES.map(city => (
						<g key={city.id}>
							{city.hub && (
								<circle
									cx={city.x}
									cy={city.y}
									r={5}
									className="fill-accent-orange animate-ping"
									opacity={0.5}
									style={{ transformOrigin: `${city.x}px ${city.y}px` }}
								/>
							)}
							<circle
								cx={city.x}
								cy={city.y}
								r={city.hub ? 4.5 : 3}
								className={city.hub ? HUB_COLOR : NODE_COLOR}
								filter="url(#globe-glow)"
							/>
						</g>
					))}
				</g>

				<circle
					cx={CENTER}
					cy={CENTER}
					r={RADIUS}
					fill="url(#globe-shade)"
					pointerEvents="none"
				/>
			</svg>
		</div>
	)
}
