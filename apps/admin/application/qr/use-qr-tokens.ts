'use client'

import { useState, useEffect, useCallback } from 'react'
import { qrTokenRepository } from '@/infrastructure/repositories/mock-qr-token-repository'
import type { QRToken } from '@/domain/entities/qr-token'

export function useQRTokens() {
	const [tokens, setTokens] = useState<QRToken[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		qrTokenRepository.getAll().then(data => {
			setTokens(data)
			setIsLoading(false)
		})
	}, [])

	const revoke = useCallback(async (token: string) => {
		await qrTokenRepository.revoke(token)
		setTokens(prev =>
			prev.map(t =>
				t.token === token
					? {
							...t,
							status: 'revoked' as const,
							revokedAt: new Date().toISOString(),
						}
					: t,
			),
		)
	}, [])

	const generate = useCallback(async (batch: string, quantity: number) => {
		const generated = await qrTokenRepository.generate(batch, quantity)
		setTokens(prev => [...prev, ...generated])
		return generated
	}, [])

	return { tokens, isLoading, revoke, generate }
}

export function useQRToken(token: string) {
	const [qrToken, setQRToken] = useState<QRToken | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		qrTokenRepository.getByToken(token).then(data => {
			setQRToken(data)
			setIsLoading(false)
		})
	}, [token])

	const revoke = useCallback(async () => {
		if (!qrToken) return
		await qrTokenRepository.revoke(qrToken.token)
		setQRToken(prev =>
			prev
				? {
						...prev,
						status: 'revoked' as const,
						revokedAt: new Date().toISOString(),
					}
				: null,
		)
	}, [qrToken])

	return { qrToken, isLoading, revoke }
}
