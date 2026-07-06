// Animated silhouette of Côte d'Ivoire: a dotted-texture map of the country
// with little person markers in the main cities, linked by an animated flow of
// "transactions" — objects handed back from finders to their owners.
// Outline and city positions are traced from a reference map of the country.

const VIEW_W = 440
const VIEW_H = 460

// National border projected from real geographic boundary data (Natural Earth
// 50m), simplified — accurate shape: wavy north, eastern bulge toward
// Bondoukou, the Abidjan south-east coast, and the Tabou tip in the south-west.
// The Abidjan lagoon coastline was smoothed for a cleaner silhouette.
const BORDER: [number, number][] = [
	[68, 65],
	[79, 61],
	[89, 49],
	[99, 48],
	[107, 59],
	[129, 66],
	[133, 54],
	[149, 54],
	[152, 34],
	[166, 40],
	[166, 33],
	[176, 30],
	[180, 50],
	[177, 59],
	[185, 63],
	[190, 63],
	[202, 51],
	[220, 48],
	[231, 56],
	[248, 60],
	[256, 80],
	[278, 93],
	[296, 98],
	[300, 92],
	[330, 81],
	[365, 82],
	[390, 111],
	[398, 108],
	[399, 120],
	[395, 135],
	[404, 151],
	[410, 188],
	[392, 205],
	[380, 251],
	[364, 276],
	[364, 286],
	[379, 345],
	[381, 349],
	[392, 352],
	[394, 362],
	[390, 380],
	[382, 382],
	[368, 377],
	[370, 367],
	[367, 367],
	[357, 381],
	[315, 372],
	[283, 374],
	[255, 380],
	[225, 382],
	[198, 389],
	[96, 430],
	[93, 400],
	[95, 384],
	[103, 369],
	[102, 336],
	[81, 328],
	[75, 312],
	[50, 306],
	[30, 295],
	[47, 276],
	[49, 265],
	[38, 229],
	[41, 226],
	[53, 229],
	[67, 196],
	[65, 190],
	[52, 185],
	[53, 172],
	[65, 170],
	[79, 172],
	[84, 177],
	[88, 175],
	[85, 161],
	[71, 152],
	[72, 139],
	[82, 133],
	[73, 126],
	[74, 112],
	[66, 113],
	[59, 107],
	[58, 77],
]

const BORDER_PATH =
	BORDER.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z'

// Centroid used to bow the transaction arcs outward from the country's center.
const CENTER: [number, number] = [230, 245]

interface City {
	id: string
	name: string
	x: number
	y: number
	hub?: boolean
	minor?: boolean
	labelDx?: number
	labelDy?: number
	labelAnchor?: 'start' | 'middle' | 'end'
}

// Cities positioned by projecting their real lon/lat with the same projection
// used for the border above. Hubs = the two capitals; minor = secondary towns
// (smaller marker + label) added for coverage.
const CITIES: City[] = [
	// Capitals / major cities
	{ id: 'odienne', name: 'Odienné', x: 95, y: 107, labelDy: -12 },
	{ id: 'korhogo', name: 'Korhogo', x: 215, y: 109, labelDy: -12 },
	{
		id: 'man',
		name: 'Man',
		x: 96,
		y: 238,
		labelDx: -13,
		labelDy: 3,
		labelAnchor: 'end',
	},
	{
		id: 'daloa',
		name: 'Daloa',
		x: 164,
		y: 272,
		labelDx: -13,
		labelDy: 3,
		labelAnchor: 'end',
	},
	{ id: 'bouake', name: 'Bouaké', x: 253, y: 220, hub: true, labelDy: -12 },
	{
		id: 'yamoussoukro',
		name: 'Yamoussoukro',
		x: 236,
		y: 275,
		hub: true,
		labelDx: 13,
		labelDy: 3,
		labelAnchor: 'start',
	},
	{ id: 'abengourou', name: 'Abengourou', x: 348, y: 281, labelDy: -12 },
	{ id: 'gagnoa', name: 'Gagnoa', x: 195, y: 318, labelDy: 15 },
	{ id: 'san-pedro', name: 'San-Pédro', x: 153, y: 405, labelDy: 16 },
	{
		id: 'abidjan',
		name: 'Abidjan',
		x: 315,
		y: 368,
		hub: true,
		labelDx: 13,
		labelDy: 4,
		labelAnchor: 'start',
	},
	// Secondary towns
	{
		id: 'boundiali',
		name: 'Boundiali',
		x: 162,
		y: 105,
		minor: true,
		labelDy: -10,
	},
	{
		id: 'dabakala',
		name: 'Dabakala',
		x: 290,
		y: 178,
		minor: true,
		labelDy: -10,
	},
	{
		id: 'bondoukou',
		name: 'Bondoukou',
		x: 391,
		y: 198,
		minor: true,
		labelDy: -10,
	},
	{ id: 'katiola', name: 'Katiola', x: 248, y: 193, minor: true, labelDy: -10 },
	{
		id: 'seguela',
		name: 'Séguéla',
		x: 150,
		y: 203,
		minor: true,
		labelDx: -11,
		labelDy: 3,
		labelAnchor: 'end',
	},
	{ id: 'bouafle', name: 'Bouaflé', x: 208, y: 264, minor: true, labelDy: -10 },
	{
		id: 'divo',
		name: 'Divo',
		x: 232,
		y: 337,
		minor: true,
		labelDx: 11,
		labelDy: 3,
		labelAnchor: 'start',
	},
	{
		id: 'soubre',
		name: 'Soubré',
		x: 155,
		y: 340,
		minor: true,
		labelDx: -11,
		labelDy: 3,
		labelAnchor: 'end',
	},
	{
		id: 'sassandra',
		name: 'Sassandra',
		x: 187,
		y: 392,
		minor: true,
		labelDy: 14,
	},
	{
		id: 'agboville',
		name: 'Agboville',
		x: 303,
		y: 331,
		minor: true,
		labelDx: 11,
		labelDy: 3,
		labelAnchor: 'start',
	},
	{ id: 'aboisso', name: 'Aboisso', x: 366, y: 360, minor: true, labelDy: -10 },
]

const CITY_BY_ID = new Map(CITIES.map(city => [city.id, city]))

// Flows of returned objects between cities (finder → owner).
const FLOWS: [string, string][] = [
	['san-pedro', 'abidjan'],
	['abidjan', 'yamoussoukro'],
	['yamoussoukro', 'bouake'],
	['bouake', 'korhogo'],
	['korhogo', 'odienne'],
	['daloa', 'yamoussoukro'],
	['man', 'daloa'],
	['gagnoa', 'yamoussoukro'],
	['abengourou', 'abidjan'],
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
	const random = mulberry32(2024)
	const dots: { x: number; y: number; r: number; o: number }[] = []
	const step = 11

	for (let x = 25; x <= VIEW_W - 25; x += step) {
		for (let y = 25; y <= VIEW_H - 25; y += step) {
			const jx = x + (random() - 0.5) * 4
			const jy = y + (random() - 0.5) * 4
			if (!pointInPolygon(jx, jy, BORDER)) continue
			dots.push({
				x: jx,
				y: jy,
				r: 1 + random() * 0.8,
				o: 0.22 + random() * 0.4,
			})
		}
	}
	return dots
}

const DOTS = generateDots()

/**
 * Quadratic arc bowed outward from the country center, like a flight path.
 * Returns the absolute path (for the visible line) and a *relative* copy that
 * starts at (0,0) — used for the moving packet so that, at rest, the packet
 * sits on its origin city (via cx/cy) instead of flashing at the SVG origin.
 */
function arcPaths(from: City, to: City, bow = 0.16) {
	const mx = (from.x + to.x) / 2
	const my = (from.y + to.y) / 2
	const dx = to.x - from.x
	const dy = to.y - from.y
	const len = Math.hypot(dx, dy) || 1
	// Perpendicular to the chord.
	const nx = -dy / len
	const ny = dx / len
	// Point it away from the country center so arcs arch outward.
	const away = (mx - CENTER[0]) * nx + (my - CENTER[1]) * ny
	const sign = away >= 0 ? 1 : -1
	const cx = mx + sign * nx * len * bow
	const cy = my + sign * ny * len * bow
	return {
		d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
		motion: `M 0 0 Q ${cx - from.x} ${cy - from.y} ${to.x - from.x} ${to.y - from.y}`,
	}
}

/** Crisp little "person" glyph (head + torso) marking a city. */
function PersonMarker({
	x,
	y,
	hub,
	minor,
}: {
	x: number
	y: number
	hub?: boolean
	minor?: boolean
}) {
	const scale = hub ? 1.5 : minor ? 0.85 : 1.15
	const haloR = hub ? 9 : minor ? 5.5 : 7.5
	const colorClass = hub ? 'fill-accent-orange' : 'fill-primary-green'

	return (
		<g transform={`translate(${x} ${y})`}>
			{hub && (
				<circle
					r={11}
					className="fill-accent-orange animate-ping"
					opacity={0.3}
					style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
				/>
			)}
			<circle
				r={haloR}
				className={hub ? 'fill-accent-orange/15' : 'fill-primary-green/12'}
			/>
			<g transform={`scale(${scale})`} className={colorClass}>
				<circle cy={-3} r={1.9} />
				<path d="M-3.1 4 C-3.1 0.2 -1.7 -0.7 0 -0.7 C1.7 -0.7 3.1 0.2 3.1 4 Z" />
			</g>
		</g>
	)
}

export function HeroMap() {
	return (
		<div
			aria-hidden
			className="animate-scale-in pointer-events-none absolute top-1/2 -right-10 hidden h-136 w-128 -translate-y-1/2 xl:block 2xl:-right-4"
		>
			<svg
				viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
				className="h-full w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.10)]"
			>
				<defs>
					<linearGradient id="map-fill" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor="var(--background)" />
						<stop offset="100%" stopColor="var(--muted)" />
					</linearGradient>
					<clipPath id="map-clip">
						<path d={BORDER_PATH} />
					</clipPath>
					<filter id="map-glow" x="-100%" y="-100%" width="300%" height="300%">
						<feGaussianBlur stdDeviation="1.6" />
					</filter>
				</defs>

				{/* Country silhouette */}
				<path
					d={BORDER_PATH}
					fill="url(#map-fill)"
					className="stroke-primary-green/40"
					strokeWidth={1.5}
					strokeLinejoin="round"
				/>

				{/* Dotted texture clipped to the country */}
				<g clipPath="url(#map-clip)">
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
				</g>

				{/* Transaction flows between cities */}
				{FLOWS.map(([fromId, toId], i) => {
					const from = CITY_BY_ID.get(fromId)
					const to = CITY_BY_ID.get(toId)
					if (!from || !to) return null
					const { d, motion } = arcPaths(from, to)
					const pathId = `map-flow-${i}`

					return (
						<g key={pathId}>
							<path
								id={pathId}
								d={d}
								fill="none"
								className="stroke-primary-green"
								strokeWidth={1}
								strokeOpacity={0.18}
							/>
							<path
								d={d}
								fill="none"
								className="stroke-accent-orange animate-flow-dash"
								strokeWidth={1.25}
								strokeOpacity={0.55}
								strokeDasharray="1 8"
								style={{ animationDelay: `${i * 0.18}s` }}
							/>
							{/* Packet rests on its origin city (cx/cy) and follows a
							    relative path — never flashes at the SVG origin. */}
							<circle
								cx={from.x}
								cy={from.y}
								r={2.4}
								className="fill-accent-orange"
								filter="url(#map-glow)"
							>
								<animateMotion
									dur={`${3.2 + i * 0.35}s`}
									begin={`-${i * 0.55}s`}
									repeatCount="indefinite"
									path={motion}
									calcMode="linear"
								/>
							</circle>
						</g>
					)
				})}

				{/* People (little figures) at each city */}
				{CITIES.map(city => (
					<g key={city.id}>
						<PersonMarker
							x={city.x}
							y={city.y}
							hub={city.hub}
							minor={city.minor}
						/>
						<text
							x={city.x + (city.labelDx ?? 0)}
							y={city.y + (city.labelDy ?? -11)}
							textAnchor={city.labelAnchor ?? 'middle'}
							className={
								city.minor
									? 'fill-muted-foreground/80 text-[8px] font-medium'
									: 'fill-muted-foreground text-[9px] font-medium'
							}
						>
							{city.name}
						</text>
					</g>
				))}
			</svg>
		</div>
	)
}
