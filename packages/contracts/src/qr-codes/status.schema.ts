import { z } from 'zod'
import { QR_TOKEN_STATUSES } from './qr-codes.const'

export const qrTokenStatusSchema = z.enum(QR_TOKEN_STATUSES, {
	error: 'Statut invalide',
})

export type QrTokenStatus = z.output<typeof qrTokenStatusSchema>
