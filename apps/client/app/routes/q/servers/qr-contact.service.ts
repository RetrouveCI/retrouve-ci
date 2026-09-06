import type { z } from 'zod'
import type { ReachChannel } from '@app/contracts/qr-codes'
import { apiFetch } from '@/shared/utils/api-fetch'
import type { qrContactSchema } from '../qr-contact.schema'

export interface QrTokenPublicView {
	status: 'generated' | 'activated' | 'revoked'
	ownerFirstName: string | null
	label: string | null
	linkedObject: string | null
	/** Whether the owner accepted being reached directly. Never a number. */
	directContact: boolean
}

export async function getQrTokenPublicView(
	code: string,
): Promise<QrTokenPublicView> {
	return apiFetch<QrTokenPublicView>(`/qr-codes/${code}/scan`)
}

export async function contactQrOwner(
	code: string,
	data: z.infer<typeof qrContactSchema>,
): Promise<void> {
	await apiFetch(`/qr-codes/${code}/contact`, {
		method: 'POST',
		body: JSON.stringify(data),
	})
}

/**
 * Answers where the jump goes, from a `servers/` action only: the number lives
 * here for one server-side call, then leaves as a `Location` header. A page
 * script cannot read it — a `manual` redirect is opaque in a browser.
 */
export async function reachQrOwner(
	code: string,
	channel: ReachChannel,
): Promise<string> {
	const { url } = await apiFetch<{ url: string }>(`/qr-codes/${code}/reach`, {
		method: 'POST',
		body: JSON.stringify({ channel }),
	})

	return url
}
