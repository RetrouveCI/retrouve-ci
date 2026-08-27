import { Button, InputOTP, InputOTPGroup } from '@app/ui/components'
import { OTP_LENGTH } from '@app/contracts/shared'
import { Loader2, CheckCircle2, RefreshCw } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { OtpSlots } from './otp-slots'

interface OtpStepProps {
	otp: string
	setOtp: (v: string) => void
	otpError: boolean
	setOtpError: (v: boolean) => void
	timeLeft: number
	resendIn: number
	canResend: boolean
	isSubmitting: boolean
	formatTime: (s: number) => string
	onResend: () => void
	onEditPhone: () => void
}

export function OtpStep({
	otp,
	setOtp,
	otpError,
	setOtpError,
	timeLeft,
	resendIn,
	canResend,
	isSubmitting,
	formatTime,
	onResend,
	onEditPhone,
}: OtpStepProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="flex justify-center">
					<InputOTP
						name="otp"
						maxLength={OTP_LENGTH}
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

			<div className="flex flex-col items-center gap-3">
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
					<p className="text-destructive text-center text-sm font-medium">
						Code expiré. Demandez-en un nouveau.
					</p>
				)}

				<button
					type="button"
					onClick={onResend}
					disabled={isSubmitting || !canResend}
					className="text-primary-green hover:text-primary-green-dark inline-flex min-h-11 items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
				>
					<RefreshCw
						className={cn('h-4 w-4', isSubmitting && 'animate-spin')}
					/>
					{canResend ? 'Renvoyer le code' : `Renvoyer le code (${resendIn} s)`}
				</button>

				<button
					type="button"
					onClick={onEditPhone}
					className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center text-sm underline-offset-4 transition-colors hover:underline"
				>
					Modifier le numéro
				</button>
			</div>

			<Button
				type="submit"
				className="bg-primary-green hover:bg-primary-green-dark h-12 w-full rounded-xl text-base font-semibold text-white transition-all hover:scale-[1.02]"
				disabled={isSubmitting || otp.length < OTP_LENGTH || timeLeft === 0}
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
