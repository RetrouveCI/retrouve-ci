import type { z } from 'zod'
import { apiFetch } from '@/shared/lib/api-client'
import type { qrContactSchema } from '../qr-contact.schema'

export interface QrTokenPublicView {
	status: 'generated' | 'activated' | 'revoked'
	ownerFirstName: string | null
	label: string | null
	linkedObject: string | null
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
