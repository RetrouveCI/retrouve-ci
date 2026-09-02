import { useCallback, useEffect, useRef, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { useAuth } from '@/context/auth'
import { pageMeta } from '@/shared/helpers/page-meta'
import { ActivationSheet } from './components/activation-sheet'
import { CameraView } from './components/camera-view'
import { ManualCodeForm } from './components/manual-code-form'
import { PhotoCapture } from './components/photo-capture'
import { ScanBlocked, ScanPrimer } from './components/scan-primer'
import { parseStickerCode } from './helpers/sticker-code'
import { useStickerScanner } from './hooks/use-sticker-scanner'
import { scanAction } from './servers/scan.action'
import type { ScannedStickerStatus } from './servers/sticker-status.loader'
import { SUCCESS_PARAM } from '@/shared/helpers/install-prompt'

export function meta() {
	return pageMeta({
		title: 'Scanner',
		description:
			"Scannez un sticker RetrouveCI pour l'activer ou prévenir son propriétaire.",
	})
}

export const action = scanAction

const FOREIGN_NOTICE_MS = 2500

/** « Terminer » ends a batch, which is the second success R25 may follow. */
const FINISHED_TO = `/account/stickers?${SUCCESS_PARAM}=activated`

/**
 * Two destinations, one rule: a sticker still waiting to be activated opens the
 * activation sheet, everything else goes to `/q/:code`. That screen stays the
 * single contact screen of flux B — the sheet contacts nobody, it names an
 * object the visitor owns.
 *
 * The status lookup runs only for a signed-in visitor. Somebody who has just
 * found an object has no account and nothing to activate, so their scan costs
 * exactly what it cost before R22: one navigation.
 */
export default function ScanPage() {
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth()
	const status = useFetcher<ScannedStickerStatus>()
	const [manualEntry, setManualEntry] = useState(false)
	const [foreignCode, setForeignCode] = useState(false)
	const [checking, setChecking] = useState<string | null>(null)
	const [activating, setActivating] = useState<string | null>(null)

	const openCode = useCallback(
		(code: string) => navigate(`/q/${encodeURIComponent(code)}`),
		[navigate],
	)

	const handleCode = (code: string) => {
		if (!isAuthenticated) {
			void openCode(code)
			return
		}

		setChecking(code)
		status.load(`/scan/status?code=${encodeURIComponent(code)}`)
	}

	// Detection only stops on the render after a read, and the same QR is still
	// in front of the lens: the first read wins, or one sticker fires a lookup
	// every 200 ms.
	const reading = useRef(false)

	const scanner = useStickerScanner(raw => {
		const parsed = parseStickerCode(raw)
		if (!parsed.ok) {
			setForeignCode(true)
			return
		}

		if (reading.current) return
		reading.current = true
		handleCode(parsed.code)
	})

	// Paused, not stopped: see `use-sticker-scanner`.
	const { pause } = scanner
	useEffect(() => {
		if (checking || activating) pause()
	}, [checking, activating, pause])

	// React Router hands back a new answer object per load, so its identity tells
	// this answer from the last: rescanning the sticker just activated must ask
	// again rather than reuse « generated ».
	const handled = useRef<ScannedStickerStatus | undefined>(undefined)

	useEffect(() => {
		const answer = status.data
		if (!checking || status.state !== 'idle') return
		if (!answer || answer.code !== checking || answer === handled.current) {
			return
		}

		handled.current = answer
		setChecking(null)

		if (answer.status === 'generated') {
			setActivating(answer.code)
			return
		}

		void openCode(answer.code)
	}, [checking, status.data, status.state, openCode])

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

	const scanNext = () => {
		setActivating(null)
		reading.current = false
		scanner.resume()
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
						onCode={handleCode}
						onBack={
							scanner.status === 'blocked'
								? undefined
								: () => setManualEntry(false)
						}
					/>
				) : scanner.status === 'blocked' ? (
					<ScanBlocked reason={scanner.blockedReason}>
						<ManualCodeForm onCode={handleCode} />
						{/* A decoder that failed to load cannot read a photograph either. */}
						{scanner.blockedReason === 'unsupported' ? null : (
							<PhotoCapture onCode={handleCode} />
						)}
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
					codeRead={scanner.paused}
				/>
			) : null}

			{activating ? (
				<ActivationSheet
					code={activating}
					onNext={scanNext}
					onFinish={() => void navigate(FINISHED_TO)}
				/>
			) : null}
		</main>
	)
}
