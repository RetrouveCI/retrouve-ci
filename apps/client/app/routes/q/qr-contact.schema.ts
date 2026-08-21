import type { z } from 'zod'
import { contactOwnerSchema } from '@app/contracts/qr-codes'

export const qrContactSchema = contactOwnerSchema

export type QrContactInput = z.input<typeof qrContactSchema>
export type QrContactData = z.output<typeof qrContactSchema>
