import { useEffect } from 'react'
import type { RefObject } from 'react'
import { X, Flashlight, Keyboard, Info } from 'lucide-react'
import { cn } from '@app/ui/utils'

interface CameraViewProps {
	videoRef: RefObject<HTMLVideoElement | null>
	onClose: () => void
	onManualEntry: () => void
	torchOn: boolean
	torchAvailable: boolean
	onToggleTorch: () => void
	foreignCode: boolean
}

/**
 * A viewfinder is the one surface that is dark in both themes — it sits on a
 * live image, not on a page. The tokens stop at its edge, which is why the
 * colours here are literal rather than semantic.
 */
export function CameraView({
	videoRef,
	onClose,
	onManualEntry,
	torchOn,
	torchAvailable,
	onToggleTorch,
	foreignCode,
}: CameraViewProps) {
	// The viewfinder covers the shell, so the shell must stop moving under it:
	// a page that scrolls behind a full-screen camera is the phone equivalent of
	// two screens at once. Escape closes it, as any dialog does.
	useEffect(() => {
		const { overflow } = document.body.style
		document.body.style.overflow = 'hidden'

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKeyDown)

		return () => {
			document.body.style.overflow = overflow
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [onClose])

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col bg-neutral-950"
			role="dialog"
			aria-modal="true"
			aria-label="Scanner un code"
		>
			<video
				ref={videoRef}
				className="absolute inset-0 h-full w-full object-cover"
				playsInline
				muted
			/>
			{/* The scrim stays light where the QR is aimed and goes solid under the
			    chrome: a camera points at white paper as often as at a dark scene,
			    so white text needs its own ground rather than the image's. */}
			<div className="absolute inset-0 bg-neutral-950/25" />

			<div
				className="relative flex items-center justify-between bg-neutral-950/85 px-3 py-4"
				style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
			>
				<button
					type="button"
					onClick={onClose}
					aria-label="Fermer le scanner"
					className="flex h-11 w-11 items-center justify-center rounded-full text-white"
				>
					<X className="h-5 w-5" />
				</button>
				<p className="text-base font-semibold text-white">Scanner un code</p>
				{torchAvailable ? (
					<button
						type="button"
						onClick={onToggleTorch}
						aria-label="Éclairage"
						aria-pressed={torchOn}
						className={cn(
							'flex h-11 w-11 items-center justify-center rounded-full',
							torchOn ? 'bg-white text-neutral-950' : 'text-white',
						)}
					>
						<Flashlight className="h-5 w-5" />
					</button>
				) : (
					<span className="h-11 w-11" aria-hidden="true" />
				)}
			</div>

			<div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10">
				<Viewfinder />
				<div className="rounded-2xl bg-neutral-950/85 px-5 py-3 text-center">
					<p className="text-base font-medium text-white">
						Visez le QR code du sticker
					</p>
					<p className="mt-1 text-sm text-white/90">
						{foreignCode
							? "Ce QR code n'est pas un sticker RetrouveCI."
							: 'La lecture est automatique'}
					</p>
				</div>
			</div>

			<div
				className="relative flex flex-col gap-3 bg-neutral-950/85 px-5 pt-4 pb-8"
				style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
			>
				<div className="flex items-start gap-3 rounded-[14px] border border-white/20 p-3.5">
					<Info className="mt-0.5 h-4 w-4 shrink-0 text-white/90" />
					<p className="text-sm leading-relaxed text-white/90">
						Sticker abîmé ou code illisible&nbsp;? Le code est imprimé sous le
						QR.
					</p>
				</div>
				<button
					type="button"
					onClick={onManualEntry}
					className="flex h-13 w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-white/50 text-base font-semibold text-white"
				>
					<Keyboard className="h-[18px] w-[18px]" />
					Saisir le code à la main
				</button>
			</div>
		</div>
	)
}

function Viewfinder() {
	return (
		<div className="relative h-62 w-62" aria-hidden="true">
			<div className="absolute inset-0 rounded-[28px] bg-white/5" />
			{CORNERS.map(({ key, className }) => (
				<span
					key={key}
					className={cn('absolute h-14 w-14 border-white', className)}
				/>
			))}
			<span className="bg-primary-green absolute inset-x-4 top-1/2 h-[2.5px] rounded-full shadow-[0_0_18px_rgba(70,190,116,.7)]" />
		</div>
	)
}

const CORNERS = [
	{
		key: 'tl',
		className: 'top-0 left-0 rounded-tl-[28px] border-t-4 border-l-4',
	},
	{
		key: 'tr',
		className: 'top-0 right-0 rounded-tr-[28px] border-t-4 border-r-4',
	},
	{
		key: 'bl',
		className: 'bottom-0 left-0 rounded-bl-[28px] border-b-4 border-l-4',
	},
	{
		key: 'br',
		className: 'right-0 bottom-0 rounded-br-[28px] border-r-4 border-b-4',
	},
]
