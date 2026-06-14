import { InputOTPSlot } from '@retrouve-ci/ui/components'
import { cn } from '@retrouve-ci/ui/utils'

export function OtpSlots({ error }: { error: boolean }) {
	return (
		<>
			{[0, 1, 2, 3, 4, 5].map(i => (
				<InputOTPSlot
					key={i}
					index={i}
					className={cn(
						'h-12 w-11 rounded-xl border-2 text-lg font-semibold transition-all',
						error
							? 'border-destructive bg-destructive/5'
							: 'border-border bg-background data-[active=true]:border-primary-green data-[active=true]:ring-primary-green/20 data-[active=true]:ring-2',
					)}
				/>
			))}
		</>
	)
}
