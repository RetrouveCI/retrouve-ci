import type { ReactNode } from 'react'
import { Button } from '@app/ui/components'
import { Loader2 } from 'lucide-react'

interface AuthSubmitButtonProps {
	isSubmitting: boolean
	pendingLabel: string
	disabled?: boolean
	children: ReactNode
}

/**
 * The one submit button of the auth screens. It moved out of `otp-step` and
 * `password-step` when R28 put a code and a password on a single form: two
 * blocks, one submission, so neither block may carry a button of its own.
 */
export function AuthSubmitButton({
	isSubmitting,
	pendingLabel,
	disabled,
	children,
}: AuthSubmitButtonProps) {
	return (
		<Button
			type="submit"
			className="bg-primary-green hover:bg-primary-green-dark h-control w-full rounded-[14px] text-lg font-semibold text-white transition-all hover:scale-[1.02]"
			disabled={isSubmitting || disabled}
		>
			{isSubmitting ? (
				<>
					<Loader2 className="h-4 w-4 animate-spin" /> {pendingLabel}
				</>
			) : (
				children
			)}
		</Button>
	)
}
