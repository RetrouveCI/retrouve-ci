import type { IQRTokenRepository } from '@/domain/repositories/qr-token-repository'
import type { QRToken } from '@/domain/entities/qr-token'
import { MOCK_QR_TOKENS } from '@/infrastructure/mock/data'

class MockQRTokenRepository implements IQRTokenRepository {
	private tokens: QRToken[] = [...MOCK_QR_TOKENS]

	async getAll(): Promise<QRToken[]> {
		return [...this.tokens]
	}

	async getByToken(token: string): Promise<QRToken | null> {
		return this.tokens.find(t => t.token === token) ?? null
	}

	async revoke(token: string): Promise<void> {
		this.tokens = this.tokens.map(t =>
			t.token === token
				? { ...t, status: 'revoked', revokedAt: new Date().toISOString() }
				: t,
		)
	}

	async generate(batch: string, quantity: number): Promise<QRToken[]> {
		const now = new Date().toISOString()
		const generated: QRToken[] = Array.from({ length: quantity }, (_, i) => ({
			token: `RCI-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
			status: 'generated' as const,
			batch,
			createdAt: now,
			activatedAt: null,
			revokedAt: null,
			userId: null,
			userName: null,
			linkedObject: null,
		}))
		this.tokens = [...this.tokens, ...generated]
		return generated
	}
}

export const qrTokenRepository: IQRTokenRepository =
	new MockQRTokenRepository()
