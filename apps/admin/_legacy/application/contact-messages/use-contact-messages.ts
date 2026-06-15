'use client'

import { useState, useEffect, useCallback } from 'react'
import { contactMessageRepository } from '@/infrastructure/repositories/api-contact-message-repository'
import type {
	ContactMessage,
	ContactMessageStatus,
} from '@/domain/entities/contact-message'

const PAGE_SIZE = 20

export function useContactMessages(statusFilter?: ContactMessageStatus) {
	const [messages, setMessages] = useState<ContactMessage[]>([])
	const [total, setTotal] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const refresh = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const response = await contactMessageRepository.list({
				status: statusFilter,
				page: 1,
				pageSize: PAGE_SIZE,
			})
			setMessages(response.items)
			setTotal(response.total)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Impossible de charger les messages',
			)
		} finally {
			setIsLoading(false)
		}
	}, [statusFilter])

	useEffect(() => {
		void refresh()
	}, [refresh])

	const view = useCallback(async (id: string) => {
		const message = await contactMessageRepository.getById(id)
		setMessages(prev => prev.map(m => (m.id === id ? message : m)))
		return message
	}, [])

	const archive = useCallback(async (id: string) => {
		const message = await contactMessageRepository.updateStatus(
			id,
			'archived',
		)
		setMessages(prev => prev.map(m => (m.id === id ? message : m)))
	}, [])

	return { messages, total, isLoading, error, refresh, view, archive }
}
