'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderRepository } from '@/infrastructure/repositories/mock-order-repository'
import type { StickerOrder, OrderStatus } from '@/domain/entities/order'

export function useOrders() {
	const [orders, setOrders] = useState<StickerOrder[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		orderRepository.getAll().then(data => {
			setOrders(data)
			setIsLoading(false)
		})
	}, [])

	const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
		await orderRepository.updateStatus(id, status)
		const now = new Date().toISOString()
		setOrders(prev =>
			prev.map(o => {
				if (o.id !== id) return o
				return {
					...o,
					status,
					updatedAt: now,
					shippedAt: status === 'shipped' ? now : o.shippedAt,
					deliveredAt: status === 'delivered' ? now : o.deliveredAt,
				}
			}),
		)
	}, [])

	return { orders, isLoading, updateStatus }
}
