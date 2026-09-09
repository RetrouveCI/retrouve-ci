import { cn } from '@app/ui/utils'

/**
 * The product itself, drawn rather than photographed — there is no sticker
 * artwork in `public/`, and a hero that shows the thing being sold cannot wait
 * for a shoot. The QR pattern is deliberately decorative: it carries the three
 * finder squares that make it read as a code, and nothing scannable, so no one
 * points a camera at a promise the image cannot keep.
 */
const MODULES = [
	[2, 2, 1, 0, 1, 1, 0, 1],
	[3, 1, 0, 1, 1, 0, 1, 2],
	[1, 0, 1, 1, 0, 1, 2, 1],
	[0, 1, 1, 0, 1, 2, 1, 0],
	[1, 1, 0, 1, 2, 1, 0, 1],
	[1, 0, 1, 2, 1, 0, 1, 1],
]

export type StickerTone = 'light' | 'green' | 'orange'

const TONES: Record<StickerTone, { card: string; label: string; ink: string }> =
	{
		light: { card: '#FFFFFF', label: '#1E7F43', ink: '#12201A' },
		green: { card: '#1E7F43', label: '#12613A', ink: '#FFFFFF' },
		orange: { card: '#E86A17', label: '#C0530C', ink: '#FFFFFF' },
	}

interface StickerMarkProps {
	tone?: StickerTone
	className?: string
	/** Degrees, for the scattered look the composition needs. */
	tilt?: number
}

export function StickerMark({
	tone = 'green',
	className,
	tilt = 0,
}: StickerMarkProps) {
	const { card, label, ink } = TONES[tone]

	return (
		<svg
			viewBox="0 0 120 140"
			className={cn('drop-shadow-xl', className)}
			style={tilt ? { rotate: `${tilt}deg` } : undefined}
			aria-hidden
		>
			<rect x="0" y="0" width="120" height="140" rx="18" fill={card} />

			<rect x="12" y="12" width="96" height="96" rx="12" fill="#FFFFFF" />

			{/* The three finder squares: what makes a QR legible as a QR. */}
			{[
				[20, 20],
				[80, 20],
				[20, 80],
			].map(([x, y]) => (
				<g key={`${x}-${y}`}>
					<rect
						x={x}
						y={y}
						width="20"
						height="20"
						rx="5"
						fill="none"
						stroke="#1E7F43"
						strokeWidth="4"
					/>
					<rect
						x={x + 7}
						y={y + 7}
						width="6"
						height="6"
						rx="1.5"
						fill="#E86A17"
					/>
				</g>
			))}

			{MODULES.map((row, y) =>
				row.map((cell, x) =>
					cell === 0 ? null : (
						<rect
							key={`${x}-${y}`}
							x={46 + x * 7}
							y={22 + y * 7}
							width="5"
							height="5"
							rx="1.2"
							fill={cell === 2 ? '#E86A17' : '#1E7F43'}
							opacity={cell === 3 ? 0.45 : 1}
						/>
					),
				),
			)}

			{/* The pin that stands for the brand, at the centre as on the real one. */}
			<g transform="translate(60 62)">
				<path
					d="M0 -14c-7 0-12 5-12 12 0 8 12 18 12 18s12-10 12-18c0-7-5-12-12-12z"
					fill="#E86A17"
				/>
				<circle cx="0" cy="-2" r="6" fill="#FFFFFF" />
			</g>

			<rect x="12" y="114" width="96" height="16" rx="8" fill={label} />
			<text
				x="60"
				y="125.5"
				textAnchor="middle"
				fontSize="9"
				fontWeight="700"
				fill={tone === 'light' ? '#FFFFFF' : ink}
				fontFamily="inherit"
			>
				Scanner si trouvé
			</text>
		</svg>
	)
}
