import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'
import type { BarcodeDetectorLike } from '../types/scan.types'

type PonyfillModule = typeof import('barcode-detector/ponyfill')

let ponyfill: Promise<PonyfillModule> | null = null

/**
 * Not a byte of decoder is fetched before this is called, and it is called only
 * when the scanner opens. Chrome Android answers with its own and downloads
 * nothing; Safari pays for the WASM reader once, on a metered plan.
 */
export async function loadQrDetector(): Promise<BarcodeDetectorLike> {
	const native = createNativeDetector()
	if (native) return native

	// Only the module load is cached — the expensive half. Building a detector on
	// top costs nothing, and keeps the native check above the one that decides.
	ponyfill ??= loadPonyfill()

	try {
		const { BarcodeDetector } = await ponyfill
		return new BarcodeDetector({ formats: ['qr_code'] })
	} catch (error) {
		// A failure is never cached: the next opening is a fresh attempt, which
		// matters most when the load failed for want of network.
		ponyfill = null
		throw error
	}
}

async function loadPonyfill(): Promise<PonyfillModule> {
	const module = await import('barcode-detector/ponyfill')

	// The binary is served from our own origin rather than the library's default
	// CDN: no third party has business seeing a scan, and R24's service worker
	// can only precache what we serve ourselves.
	module.setZXingModuleOverrides({
		locateFile: (path: string, prefix: string) =>
			path.endsWith('.wasm') ? wasmUrl : `${prefix}${path}`,
	})

	return module
}

function createNativeDetector(): BarcodeDetectorLike | null {
	const Detector = window.BarcodeDetector
	if (!Detector) return null

	try {
		return new Detector({ formats: ['qr_code'] })
	} catch {
		return null
	}
}
