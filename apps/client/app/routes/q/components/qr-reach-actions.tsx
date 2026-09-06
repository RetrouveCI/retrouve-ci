import { Form } from 'react-router'
import { MessageCircle, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReachChannel } from '@app/contracts/qr-codes'

interface QrReachActionsProps {
	code: string
	ownerFirstName: string | null
}

const PRIMARY =
	'bg-primary-green hover:bg-primary-green-dark flex min-h-15 w-full items-center justify-center gap-2.5 rounded-[14px] text-base font-semibold text-white transition-colors'

const SECONDARY =
	'border-border hover:bg-muted flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[14px] border-[1.5px] text-base font-semibold transition-colors'

interface ReachButtonProps {
	code: string
	channel: ReachChannel
	icon: LucideIcon
	className: string
	children: string
}

/**
 * `reloadDocument` is the whole point: the browser posts and follows the
 * `Location` itself, so the jump needs no JavaScript and the target never enters
 * the page. A device with no dialer simply stays here, message form included.
 */
function ReachButton({
	code,
	channel,
	icon: Icon,
	className,
	children,
}: ReachButtonProps) {
	return (
		<Form method="post" action={`/q/${code}/reach`} reloadDocument>
			<input type="hidden" name="channel" value={channel} />
			<button type="submit" className={className}>
				<Icon className="h-5 w-5 shrink-0" />
				{children}
			</button>
		</Form>
	)
}

/** Drawn only where the owner consented — §3 A8, and the column is closed by default. */
export function QrReachActions({ code, ownerFirstName }: QrReachActionsProps) {
	return (
		<div className="space-y-2.5">
			<ReachButton
				code={code}
				channel="whatsapp"
				icon={MessageCircle}
				className={PRIMARY}
			>
				{ownerFirstName
					? `Prévenir ${ownerFirstName} sur WhatsApp`
					: 'Prévenir sur WhatsApp'}
			</ReachButton>
			<ReachButton
				code={code}
				channel="call"
				icon={Phone}
				className={SECONDARY}
			>
				Appeler
			</ReachButton>
		</div>
	)
}
