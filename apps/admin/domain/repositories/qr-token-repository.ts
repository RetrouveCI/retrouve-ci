import type { QRToken } from '@/domain/entities/qr-token'

export interface IQRTokenRepository {
	getAll(): Promise<QRToken[]>
	getByToken(token: string): Promise<QRToken | null>
	revoke(token: string): Promise<void>
	generate(batch: string, quantity: number): Promise<QRToken[]>
}
