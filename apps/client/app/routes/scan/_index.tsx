import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ScanLine, ArrowRight } from 'lucide-react'
import { Button } from '@app/ui/components'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Scanner',
		description:
			"Scannez un sticker RetrouveCI pour l'activer ou prévenir son propriétaire.",
	})
}

/**
 * R6 opens this route because the tab bar now leads here, and a tab that leads
 * nowhere is worse than no tab. **R20 replaces the screen** with the camera and
 * its permission primer; what stays is the code entry below, which R21 keeps as
 * the universal fallback and which §3 names as the desktop equivalent of a scan.
 *
 * Everything a scan can do already lives at `/q/:code` — this screen only has to
 * get the visitor there.
 */
export default function ScanPage() {
	const navigate = useNavigate()
	const [code, setCode] = useState('')

	const normalised = code.trim().toUpperCase()

	return (
		<main className="flex-1">
			<section className="container mx-auto max-w-md px-4 py-10">
				<div className="bg-primary-green/10 mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
					<ScanLine className="text-primary-green-text h-7 w-7" />
				</div>

				<h1 className="mb-2 text-2xl font-bold">Scanner un sticker</h1>
				<p className="text-muted-foreground mb-8">
					Pour l&apos;activer, ou pour prévenir son propriétaire.
				</p>

				<form
					onSubmit={event => {
						event.preventDefault()
						if (normalised) navigate(`/q/${encodeURIComponent(normalised)}`)
					}}
					className="space-y-3"
				>
					<label htmlFor="sticker-code" className="block text-sm font-medium">
						Saisissez le code du sticker
					</label>
					<input
						id="sticker-code"
						name="code"
						value={code}
						onChange={event => setCode(event.target.value)}
						placeholder="RCI-XXXX-XXXX"
						autoComplete="off"
						autoCapitalize="characters"
						spellCheck={false}
						className="border-input bg-background focus-visible:ring-ring h-13 w-full rounded-xl border px-4 text-base tracking-wider uppercase focus-visible:ring-2 focus-visible:outline-none"
					/>
					<Button
						type="submit"
						disabled={normalised.length === 0}
						className="bg-primary-green hover:bg-primary-green-dark h-13 w-full gap-2 rounded-xl text-white"
					>
						Continuer
						<ArrowRight className="h-4 w-4" />
					</Button>
				</form>

				<p className="text-muted-foreground mt-6 text-xs">
					Le code est imprimé sous le QR de chaque sticker.
				</p>
			</section>
		</main>
	)
}
