import { act } from 'react'
import {
	OTP_RESEND_DELAY_SECONDS,
	OTP_TTL_SECONDS,
} from '@app/contracts/shared'
import { page, render } from '@/shared/helpers/testing'
import { useOtpCountdown } from '../use-otp-countdown'

let restart: () => void

function Probe() {
	const countdown = useOtpCountdown()
	restart = countdown.restart

	return (
		<dl>
			<dd data-testid="left">{countdown.formatTime(countdown.timeLeft)}</dd>
			<dd data-testid="resend-in">{countdown.resendIn}</dd>
			<dd data-testid="can-resend">{String(countdown.canResend)}</dd>
		</dl>
	)
}

const left = () => page.getByTestId('left')
const resendIn = () => page.getByTestId('resend-in')
const canResend = () => page.getByTestId('can-resend')

function tick(seconds: number) {
	act(() => {
		vi.advanceTimersByTime(seconds * 1000)
	})
}

beforeEach(() => {
	vi.useFakeTimers()
	render(<Probe />)
})

afterEach(() => {
	vi.useRealTimers()
})

describe('useOtpCountdown', () => {
	// The drift R27 closed: both screens counted down from a hard-coded 120,
	// which disabled Confirmer on a code the server honoured for three more
	// minutes.
	it('starts from the TTL the server actually grants', async () => {
		await expect.element(left()).toHaveTextContent('05:00')
		expect(OTP_TTL_SECONDS).toBe(300)
	})

	it('counts the code down second by second', async () => {
		tick(61)

		await expect.element(left()).toHaveTextContent('03:59')
	})

	it('opens the resend well before the code expires', async () => {
		await expect.element(canResend()).toHaveTextContent('false')
		await expect
			.element(resendIn())
			.toHaveTextContent(String(OTP_RESEND_DELAY_SECONDS))

		tick(OTP_RESEND_DELAY_SECONDS)

		await expect.element(canResend()).toHaveTextContent('true')
		await expect.element(resendIn()).toHaveTextContent('0')
		// The code is still very much alive at that point.
		await expect.element(left()).toHaveTextContent('04:30')
	})

	it('never counts past the expiry', async () => {
		tick(OTP_TTL_SECONDS + 120)

		await expect.element(left()).toHaveTextContent('00:00')
	})

	it('gives a fresh code the full delay again', async () => {
		tick(OTP_TTL_SECONDS)
		await expect.element(left()).toHaveTextContent('00:00')

		act(() => restart())

		await expect.element(left()).toHaveTextContent('05:00')
		await expect.element(canResend()).toHaveTextContent('false')
	})
})
