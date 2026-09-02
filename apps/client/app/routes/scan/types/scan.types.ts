export interface DetectedBarcode {
	rawValue: string
}

export interface BarcodeDetectorLike {
	detect(source: CanvasImageSource): Promise<DetectedBarcode[]>
}

export interface BarcodeDetectorConstructor {
	new (options?: { formats?: string[] }): BarcodeDetectorLike
}

/**
 * Neither the detector nor the torch is in `lib.dom` — both are shipped by
 * Chromium and specified outside the DOM standard. Declaring them here is what
 * lets the hook read `getCapabilities().torch` without an assertion.
 */
declare global {
	interface Window {
		BarcodeDetector?: BarcodeDetectorConstructor
	}

	interface MediaTrackCapabilities {
		torch?: boolean
	}

	interface MediaTrackConstraintSet {
		torch?: ConstrainBoolean
	}
}

/**
 * Why the camera cannot read a code, which decides what the screen offers.
 * `unsupported` no longer means the browser has no detector — R21 loads one —
 * but that the decoder could not be fetched, which is the one reason the photo
 * fallback is not offered against: it needs the same decoder.
 */
export type ScannerBlockedReason = 'unsupported' | 'denied' | 'unavailable'

export type ScannerStatus = 'idle' | 'requesting' | 'live' | 'blocked'
