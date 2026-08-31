/**
 * The objects a sticker goes on, as flat silhouettes rather than photographs:
 * `public/` holds no product photography, and this composition must not wait for
 * a shoot. Each object is one slot — a photo can replace a silhouette later
 * without the layout moving.
 */
function Phone() {
	return (
		<svg viewBox="0 0 120 210" className="h-full w-full" aria-hidden>
			<rect
				x="4"
				y="4"
				width="112"
				height="202"
				rx="20"
				fill="#F4F7F5"
				stroke="#DCE5DE"
				strokeWidth="2"
			/>
			<rect x="14" y="16" width="92" height="178" rx="13" fill="#FFFFFF" />
			<rect x="44" y="8" width="32" height="6" rx="3" fill="#DCE5DE" />
		</svg>
	)
}

function Bottle() {
	return (
		<svg viewBox="0 0 96 230" className="h-full w-full" aria-hidden>
			<rect x="34" y="4" width="28" height="26" rx="6" fill="#2F4A3A" />
			<path
				d="M28 30h40c8 0 14 7 14 15v166c0 8-6 15-14 15H28c-8 0-14-7-14-15V45c0-8 6-15 14-15z"
				fill="#F4F7F5"
				stroke="#DCE5DE"
				strokeWidth="2"
			/>
		</svg>
	)
}

function Keys() {
	return (
		<svg viewBox="0 0 170 130" className="h-full w-full" aria-hidden>
			<circle
				cx="30"
				cy="42"
				r="19"
				fill="none"
				stroke="#AEBDB3"
				strokeWidth="7"
			/>
			<g fill="#C7D2CA" stroke="#B4C2B8" strokeWidth="2">
				<path d="M47 34c10-6 22-4 28 4l52 26c5 3 6 9 3 13l-4 6c-3 4-9 5-13 2l-52-26c-9 3-19-1-23-10-4-8 0-17 9-15z" />
				<path
					d="M112 62l7 12M124 70l6 10"
					stroke="#9FB0A5"
					strokeWidth="5"
					strokeLinecap="round"
					fill="none"
				/>
			</g>
			<circle cx="30" cy="42" r="7" fill="#F4F7F5" />
			<path
				d="M47 60c-6 4-9 12-6 19"
				stroke="#AEBDB3"
				strokeWidth="4"
				fill="none"
				strokeLinecap="round"
			/>
		</svg>
	)
}

function Wallet() {
	return (
		<svg viewBox="0 0 190 130" className="h-full w-full" aria-hidden>
			<rect
				x="4"
				y="14"
				width="182"
				height="104"
				rx="16"
				fill="#F4F7F5"
				stroke="#DCE5DE"
				strokeWidth="2"
			/>
			<path d="M4 46h182v14H4z" fill="#E6EDE8" />
			<rect x="128" y="62" width="42" height="26" rx="7" fill="#DCE5DE" />
		</svg>
	)
}

/** A pen-drawn arrow, as the reference has: it points at the product. */
export function CurvedArrow({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 120 90" className={className} aria-hidden>
			<path
				d="M6 12c34 4 58 22 66 52"
				fill="none"
				stroke="currentColor"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>
			<path
				d="M58 56 74 66 66 46"
				fill="none"
				stroke="currentColor"
				strokeWidth="3.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export const TAGGED_OBJECTS = { Phone, Bottle, Keys, Wallet }
