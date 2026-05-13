'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationRepository } from '@/infrastructure/repositories/mock-notification-repository'
import type { Notification } from '@/domain/entities/notification'

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		notificationRepository.getAll().then(data => {
			setNotifications(data)
			setIsLoading(false)
		})
	}, [])

	const markAsRead = useCallback(async (id: number) => {
		await notificationRepository.markAsRead(id)
		setNotifications(prev =>
			prev.map(n => (n.id === id ? { ...n, read: true } : n)),
		)
	}, [])

	const markAllAsRead = useCallback(async () => {
		await notificationRepository.markAllAsRead()
		setNotifications(prev => prev.map(n => ({ ...n, read: true })))
	}, [])

	const remove = useCallback(async (id: number) => {
		await notificationRepository.delete(id)
		setNotifications(prev => prev.filter(n => n.id !== id))
	}, [])

	const unreadCount = notifications.filter(n => !n.read).length

	return {
		notifications,
		isLoading,
		unreadCount,
		markAsRead,
		markAllAsRead,
		remove,
	}
}
