import { useCallback, useEffect, useState } from 'react'
import {
	OTP_RESEND_DELAY_SECONDS,
	OTP_TTL_SECONDS,
} from '@app/contracts/shared'

function formatTime(seconds: number): string {
	const minutes = Math.floor(seconds / 60)
		.toString()
		.padStart(2, '0')

	return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
}

/**
 * The two clocks an OTP screen runs. They answer different questions — when the
 * current code dies, and when a new one may be asked for — so they are two
 * values, not one derived from the other. Both were written twice, against a
 * hard-coded 120 s that undercut the server's own `OTP_TTL_SECONDS`.
 */
export function useOtpCountdown() {
	const [elapsed, setElapsed] = useState(0)

	useEffect(() => {
		const interval = setInterval(
			() => setElapsed(seconds => Math.min(seconds + 1, OTP_TTL_SECONDS)),
			1000,
		)

		return () => clearInterval(interval)
	}, [])

	/** Call once a new code has actually gone out, not when it is asked for. */
	const restart = useCallback(() => setElapsed(0), [])

	return {
		timeLeft: OTP_TTL_SECONDS - elapsed,
		resendIn: Math.max(OTP_RESEND_DELAY_SECONDS - elapsed, 0),
		canResend: elapsed >= OTP_RESEND_DELAY_SECONDS,
		formatTime,
		restart,
	}
}
