import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScannerBlockedReason, ScannerStatus } from '../types/scan.types'

const DETECT_INTERVAL_MS = 200

/**
 * Nothing here runs on mount. `start()` is called from a tap, and only then does
 * the system permission dialog appear — a refusal is durable, so it must never
 * be spent on a visitor who has not yet been told what the camera is for.
 */
export function useStickerScanner(onCode: (raw: string) => void) {
	const [status, setStatus] = useState<ScannerStatus>('idle')
	const [blockedReason, setBlockedReason] =
		useState<ScannerBlockedReason>('unavailable')
	const [torchOn, setTorchOn] = useState(false)
	const [torchAvailable, setTorchAvailable] = useState(false)

	const videoRef = useRef<HTMLVideoElement | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const onCodeRef = useRef(onCode)
	onCodeRef.current = onCode

	const stop = useCallback(() => {
		streamRef.current?.getTracks().forEach(track => track.stop())
		streamRef.current = null
		setStatus('idle')
		setTorchOn(false)
		setTorchAvailable(false)
	}, [])

	const start = useCallback(async () => {
		const detector = createDetector()
		if (!detector || !navigator.mediaDevices?.getUserMedia) {
			setBlockedReason('unsupported')
			setStatus('blocked')
			return
		}

		setStatus('requesting')

		let stream: MediaStream
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			})
		} catch (error) {
			setBlockedReason(
				error instanceof DOMException && error.name === 'NotAllowedError'
					? 'denied'
					: 'unavailable',
			)
			setStatus('blocked')
			return
		}

		streamRef.current = stream
		setTorchAvailable(
			stream.getVideoTracks()[0]?.getCapabilities?.().torch === true,
		)
		setStatus('live')
	}, [])

	// The element only exists once the live view is rendered, so the stream is
	// attached here rather than where it was opened.
	useEffect(() => {
		const video = videoRef.current
		const stream = streamRef.current
		if (status !== 'live' || !video || !stream) return

		video.srcObject = stream
		void video.play().catch(() => undefined)
	}, [status])

	useEffect(() => {
		if (status !== 'live') return

		const detector = createDetector()
		if (!detector) return

		let busy = false
		const timer = window.setInterval(() => {
			const video = videoRef.current
			if (busy || !video || video.readyState < video.HAVE_CURRENT_DATA) return

			busy = true
			detector
				.detect(video)
				.then(found => {
					const raw = found[0]?.rawValue
					if (raw) onCodeRef.current(raw)
				})
				// A frame the detector cannot read is ordinary; the next one is tried.
				.catch(() => undefined)
				.finally(() => {
					busy = false
				})
		}, DETECT_INTERVAL_MS)

		return () => window.clearInterval(timer)
	}, [status])

	useEffect(() => stop, [stop])

	const toggleTorch = useCallback(async () => {
		const track = streamRef.current?.getVideoTracks()[0]
		if (!track) return

		const next = !torchOn
		try {
			await track.applyConstraints({ advanced: [{ torch: next }] })
			setTorchOn(next)
		} catch {
			setTorchAvailable(false)
		}
	}, [torchOn])

	return {
		status,
		blockedReason,
		videoRef,
		start,
		stop,
		torchOn,
		torchAvailable,
		toggleTorch,
	}
}

function createDetector() {
	const Detector = window.BarcodeDetector
	if (!Detector) return null

	try {
		return new Detector({ formats: ['qr_code'] })
	} catch {
		return null
	}
}
