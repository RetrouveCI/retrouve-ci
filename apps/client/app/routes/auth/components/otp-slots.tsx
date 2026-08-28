import { InputOTPSlot } from '@app/ui/components'
import { OTP_LENGTH } from '@app/contracts/shared'
import { cn } from '@app/ui/utils'

export function OtpSlots({ error }: { error: boolean }) {
	return (
		<>
			{Array.from({ length: OTP_LENGTH }, (_, index) => (
				<InputOTPSlot
					key={index}
					index={index}
					className={cn(
						'h-[58px] w-[47px] rounded-xl border-[1.5px] text-2xl font-semibold tabular-nums transition-all',
						error
							? 'border-destructive bg-destructive/5'
							: 'border-primary-green bg-background data-[active=true]:ring-primary-green/15 data-[active=true]:ring-[3px]',
					)}
				/>
			))}
		</>
	)
}
