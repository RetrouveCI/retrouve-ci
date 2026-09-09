import { InputOTP, InputOTPGroup } from '@app/ui/components'
import { OTP_LENGTH, OTP_TTL_SECONDS } from '@app/contracts/shared'
import { RefreshCw } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { AuthNote } from './auth-note'
import { OtpSlots } from './otp-slots'

interface OtpStepProps {
	otp: string
	setOtp: (v: string) => void
	otpError: boolean
	setOtpError: (v: boolean) => void
	errorMessage?: string
	/** Fired as soon as the six digits are in — the step carries no button. */
	onComplete: (otp: string) => void
	resendIn: number
	canResend: boolean
	isSubmitting: boolean
	onResend: () => void
}

const TTL_MINUTES = Math.round(OTP_TTL_SECONDS / 60)

export function OtpStep({
	otp,
	setOtp,
	otpError,
	setOtpError,
	errorMessage = 'Code incorrect. Vérifiez et réessayez.',
	onComplete,
	resendIn,
	canResend,
	isSubmitting,
	onResend,
}: OtpStepProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<div className="flex justify-center">
					<InputOTP
						name="otp"
						aria-label="Code de vérification"
						maxLength={OTP_LENGTH}
						value={otp}
						onChange={val => {
							setOtp(val)
							setOtpError(false)
							if (val.length === OTP_LENGTH) onComplete(val)
						}}
						disabled={isSubmitting}
						containerClassName="gap-2"
					>
						<InputOTPGroup className="gap-2">
							<OtpSlots error={otpError} />
						</InputOTPGroup>
					</InputOTP>
				</div>
				{otpError && (
					<p className="text-destructive text-center text-sm">{errorMessage}</p>
				)}
			</div>

			<div className="flex flex-col items-center gap-2.5">
				<button
					type="button"
					onClick={onResend}
					disabled={isSubmitting || !canResend}
					className="inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4.5 text-sm font-semibold transition-colors disabled:opacity-50"
				>
					<RefreshCw
						className={cn('h-4 w-4', isSubmitting && 'animate-spin')}
					/>
					Renvoyer le code
				</button>
				{!canResend && (
					<p className="text-muted-foreground text-xs">
						Possible dans{' '}
						<b className="text-foreground tabular-nums">{resendIn} s</b>
					</p>
				)}
			</div>

			<AuthNote>
				Le SMS met parfois une minute à arriver. Le code reste valable{' '}
				{TTL_MINUTES} minutes.
			</AuthNote>
		</div>
	)
}
