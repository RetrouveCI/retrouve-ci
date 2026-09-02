import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { pageMeta } from '@/shared/helpers/page-meta'
import { CameraView } from './components/camera-view'
import { ManualCodeForm } from './components/manual-code-form'
import { ScanBlocked, ScanPrimer } from './components/scan-primer'
import { parseStickerCode } from './helpers/sticker-code'
import { useStickerScanner } from './hooks/use-sticker-scanner'

export function meta() {
	return pageMeta({
		title: 'Scanner',
		description:
			"Scannez un sticker RetrouveCI pour l'activer ou prévenir son propriétaire.",
	})
}

const FOREIGN_NOTICE_MS = 2500

/**
 * Every path out of this screen ends at `/q/:code` — the scanner reads a code,
 * it does not become a second contact screen (flux B). What changes between the
 * camera, the code entry and the browser that has neither is only how the code
 * is obtained.
 */
export default function ScanPage() {
	const navigate = useNavigate()
	const [manualEntry, setManualEntry] = useState(false)
	const [foreignCode, setForeignCode] = useState(false)

	const openCode = useCallback(
		(code: string) => navigate(`/q/${encodeURIComponent(code)}`),
		[navigate],
	)

	const scanner = useStickerScanner(
		useCallback(
			(raw: string) => {
				const parsed = parseStickerCode(raw)
				if (!parsed.ok) {
					setForeignCode(true)
					return
				}

				// Leaving the route unmounts the hook, which stops the stream.
				void openCode(parsed.code)
			},
			[openCode],
		),
	)

	useEffect(() => {
		if (!foreignCode) return

		const timer = window.setTimeout(
			() => setForeignCode(false),
			FOREIGN_NOTICE_MS,
		)
		return () => window.clearTimeout(timer)
	}, [foreignCode])

	const showManualEntry = () => {
		scanner.stop()
		setManualEntry(true)
	}

	return (
		<main className="flex-1">
			<section className="container mx-auto max-w-md px-4 py-10">
				<h1 className="mb-2 text-2xl font-bold">Scanner un sticker</h1>
				<p className="text-muted-foreground mb-8">
					Pour l&apos;activer, ou pour prévenir son propriétaire.
				</p>

				{manualEntry ? (
					<ManualCodeForm
						onCode={openCode}
						onBack={
							scanner.status === 'blocked'
								? undefined
								: () => setManualEntry(false)
						}
					/>
				) : scanner.status === 'blocked' ? (
					<ScanBlocked reason={scanner.blockedReason}>
						<ManualCodeForm onCode={openCode} />
					</ScanBlocked>
				) : (
					<ScanPrimer
						onAllow={() => void scanner.start()}
						onManualEntry={showManualEntry}
						pending={scanner.status === 'requesting'}
					/>
				)}
			</section>

			{scanner.status === 'live' ? (
				<CameraView
					videoRef={scanner.videoRef}
					onClose={scanner.stop}
					onManualEntry={showManualEntry}
					torchOn={scanner.torchOn}
					torchAvailable={scanner.torchAvailable}
					onToggleTorch={() => void scanner.toggleTorch()}
					foreignCode={foreignCode}
				/>
			) : null}
		</main>
	)
}
