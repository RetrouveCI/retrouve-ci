import { useRef, useState } from 'react'
import { Camera, CircleAlert, Loader2 } from 'lucide-react'
import { loadQrDetector } from '../helpers/qr-decoder'
import { parseStickerCode } from '../helpers/sticker-code'

type PhotoOutcome = 'foreign' | 'unreadable' | 'failed'

const OUTCOME_COPY: Record<PhotoOutcome, { title: string; detail: string }> = {
	foreign: {
		title: "Ce code n'est pas un sticker RetrouveCI",
		detail: 'Il pointe vers un autre site.',
	},
	unreadable: {
		title: 'Aucun QR code sur cette photo',
		detail: 'Cadrez le sticker de plus près, sans reflet, puis réessayez.',
	},
	failed: {
		title: "La photo n'a pas pu être lue",
		detail: 'Vérifiez votre connexion, puis réessayez.',
	},
}

interface PhotoCaptureProps {
	onCode: (code: string) => void
}

/**
 * The fallback that works where the live camera does not: the native camera app
 * hands back one still image, which the same decoder reads. Offered only where
 * the camera is out of reach — a viewfinder reads better than a photograph.
 */
export function PhotoCapture({ onCode }: PhotoCaptureProps) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [reading, setReading] = useState(false)
	const [outcome, setOutcome] = useState<PhotoOutcome | null>(null)

	const read = async (file: File) => {
		setOutcome(null)
		setReading(true)

		try {
			const detector = await loadQrDetector()
			const bitmap = await createImageBitmap(file)

			try {
				const found = await detector.detect(bitmap)
				const raw = found[0]?.rawValue
				if (!raw) {
					setOutcome('unreadable')
					return
				}

				const parsed = parseStickerCode(raw)
				if (!parsed.ok) {
					setOutcome('foreign')
					return
				}

				onCode(parsed.code)
			} finally {
				bitmap.close()
			}
		} catch {
			setOutcome('failed')
		} finally {
			setReading(false)
		}
	}

	return (
		<div className="mt-5 border-t pt-5">
			{outcome ? (
				<div
					role="alert"
					className="border-accent-orange/40 mb-4 flex gap-3 rounded-[14px] border p-3.5"
				>
					<div className="bg-accent-orange/15 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
						<CircleAlert className="text-accent-orange-text h-5 w-5" />
					</div>
					<div>
						<p className="text-base font-bold tracking-tight">
							{OUTCOME_COPY[outcome].title}
						</p>
						<p className="text-muted-foreground mt-0.5 text-sm">
							{OUTCOME_COPY[outcome].detail}
						</p>
					</div>
				</div>
			) : null}

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				capture="environment"
				className="sr-only"
				aria-hidden="true"
				tabIndex={-1}
				onChange={event => {
					const file = event.target.files?.[0]
					// Cleared so choosing the same photo twice fires a second change.
					event.target.value = ''
					if (file) void read(file)
				}}
			/>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				disabled={reading}
				className="bg-background border-border text-foreground hover:bg-muted flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] text-base font-semibold transition-colors disabled:opacity-70"
			>
				{reading ? (
					<Loader2 className="h-[18px] w-[18px] animate-spin" />
				) : (
					<Camera className="h-[18px] w-[18px]" />
				)}
				{reading
					? 'Lecture de la photo…'
					: outcome
						? 'Prendre une autre photo'
						: 'Prendre une photo du sticker'}
			</button>
			<p className="text-muted-foreground mt-2 text-center text-sm">
				Le repli photo fonctionne partout, même sans accès direct à la caméra.
			</p>
		</div>
	)
}
