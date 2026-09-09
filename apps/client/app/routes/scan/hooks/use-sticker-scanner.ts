import { useCallback, useEffect, useRef, useState } from 'react'
import { loadQrDetector } from '../helpers/qr-decoder'
import type {
	BarcodeDetectorLike,
	ScannerBlockedReason,
	ScannerStatus,
} from '../types/scan.types'

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
	// Detection stops, the stream stays open: activating twelve stickers must
	// not reopen the camera twelve times, and a permission already granted is
	// not re-asked, so a reopen would only cost the black frame in between.
	const [paused, setPaused] = useState(false)

	const videoRef = useRef<HTMLVideoElement | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const detectorRef = useRef<BarcodeDetectorLike | null>(null)
	const onCodeRef = useRef(onCode)
	onCodeRef.current = onCode

	const stop = useCallback(() => {
		streamRef.current?.getTracks().forEach(track => track.stop())
		streamRef.current = null
		setStatus('idle')
		setPaused(false)
		setTorchOn(false)
		setTorchAvailable(false)
	}, [])

	const start = useCallback(async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			setBlockedReason('unavailable')
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

		// Assigned before the next await, so leaving the route mid-load still stops
		// the tracks through the unmount cleanup.
		streamRef.current = stream

		// The camera is asked for first and the decoder loaded second: the system
		// dialog must follow the tap rather than a download.
		try {
			detectorRef.current = await loadQrDetector()
		} catch {
			stop()
			setBlockedReason('unsupported')
			setStatus('blocked')
			return
		}

		setTorchAvailable(
			stream.getVideoTracks()[0]?.getCapabilities?.().torch === true,
		)
		setPaused(false)
		setStatus('live')
	}, [stop])

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
		const detector = detectorRef.current
		if (status !== 'live' || paused || !detector) return

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
	}, [status, paused])

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

	const pause = useCallback(() => setPaused(true), [])
	const resume = useCallback(() => setPaused(false), [])

	return {
		status,
		paused,
		blockedReason,
		videoRef,
		start,
		stop,
		pause,
		resume,
		torchOn,
		torchAvailable,
		toggleTorch,
	}
}
