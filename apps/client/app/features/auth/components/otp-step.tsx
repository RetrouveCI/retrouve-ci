import { Button, InputOTP, InputOTPGroup } from '@retrouve-ci/ui/components'
import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { OtpSlots } from './otp-slots'

interface OtpStepProps {
	otp: string
	setOtp: (v: string) => void
	otpError: boolean
	setOtpError: (v: boolean) => void
	timeLeft: number
	isSubmitting: boolean
	formatTime: (s: number) => string
	onResend: () => void
}

export function OtpStep({
	otp,
	setOtp,
	otpError,
	setOtpError,
	timeLeft,
	isSubmitting,
	formatTime,
	onResend,
}: OtpStepProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="flex justify-center">
					<InputOTP
						name="otp"
						maxLength={6}
						value={otp}
						onChange={val => {
							setOtp(val)
							setOtpError(false)
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
					<p className="text-destructive text-center text-sm">
						Code incorrect. Verifiez et reessayez.
					</p>
				)}
			</div>

			<div className="flex justify-center">
				{timeLeft > 0 ? (
					<div
						className={cn(
							'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
							timeLeft <= 30
								? 'text-destructive bg-destructive/10'
								: 'bg-primary-green/10 text-primary-green',
						)}
					>
						<span className="text-base tabular-nums">
							{formatTime(timeLeft)}
						</span>
						<span className="text-muted-foreground text-xs font-normal">
							avant expiration
						</span>
					</div>
				) : (
					<button
						type="button"
						onClick={onResend}
						disabled={isSubmitting}
						className="text-primary-green hover:text-primary-green-dark inline-flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
					>
						<RefreshCw
							className={cn('h-4 w-4', isSubmitting && 'animate-spin')}
						/>
						Renvoyer le code
					</button>
				)}
			</div>

			<Button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
				disabled={isSubmitting || otp.length < 6 || timeLeft === 0}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" /> Verification...
					</>
				) : (
					<>
						<CheckCircle2 className="h-4 w-4" /> Confirmer
					</>
				)}
			</Button>
		</div>
	)
}
