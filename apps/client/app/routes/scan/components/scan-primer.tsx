import { Camera, CameraOff, Keyboard } from 'lucide-react'
import type { ScannerBlockedReason } from '../types/scan.types'

interface ScanPrimerProps {
	onAllow: () => void
	onManualEntry: () => void
	pending: boolean
}

/**
 * The screen that stands between arriving here and the system dialog. A camera
 * refusal is durable — the browser remembers it for the origin — so the reason
 * has to be given before the question is asked, not after.
 */
export function ScanPrimer({
	onAllow,
	onManualEntry,
	pending,
}: ScanPrimerProps) {
	return (
		<div className="rounded-[18px] border p-6 text-center">
			<div className="bg-primary-green/10 mx-auto mb-4 flex h-17 w-17 items-center justify-center rounded-full">
				<Camera className="text-primary-green-text h-8 w-8" />
			</div>
			<h2 className="text-xl font-bold tracking-tight">
				Autoriser la caméra pour scanner
			</h2>
			<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
				Elle sert uniquement à lire le QR code du sticker. Aucune image
				n&apos;est enregistrée ni envoyée.
			</p>

			<button
				type="button"
				onClick={onAllow}
				disabled={pending}
				className="bg-primary-green hover:bg-primary-green-dark mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold text-white transition-colors disabled:opacity-70"
			>
				{pending ? 'Ouverture de la caméra…' : 'Autoriser la caméra'}
			</button>
			<button
				type="button"
				onClick={onManualEntry}
				className="text-muted-foreground hover:text-foreground mt-2 flex h-11 w-full items-center justify-center gap-2 text-sm font-medium transition-colors"
			>
				<Keyboard className="h-4 w-4" />
				Saisir le code à la main
			</button>
		</div>
	)
}

const BLOCKED_COPY: Record<ScannerBlockedReason, string> = {
	denied:
		"Vous pouvez l'autoriser dans les réglages de votre navigateur, ou entrer le code imprimé sous le QR.",
	unavailable:
		'Aucune caméra utilisable sur cet appareil. Entrez le code imprimé sous le QR.',
	unsupported:
		"Le lecteur de QR code n'a pas pu se charger. Entrez le code imprimé sous le QR.",
}

interface ScanBlockedProps {
	reason: ScannerBlockedReason
	children: React.ReactNode
}

/** The camera is out of reach, whatever the cause; the code entry takes over. */
export function ScanBlocked({ reason, children }: ScanBlockedProps) {
	return (
		<div className="rounded-[18px] border p-6">
			<div className="text-center">
				<div className="bg-accent-orange/15 mx-auto mb-4 flex h-17 w-17 items-center justify-center rounded-full">
					<CameraOff className="text-accent-orange-text h-8 w-8" />
				</div>
				<h2 className="text-xl font-bold tracking-tight">
					{reason === 'unsupported'
						? "La lecture automatique n'est pas disponible"
						: "La caméra n'est pas accessible"}
				</h2>
				<p className="text-muted-foreground mt-2 mb-6 text-sm leading-relaxed">
					{BLOCKED_COPY[reason]}
				</p>
			</div>
			{children}
		</div>
	)
}
