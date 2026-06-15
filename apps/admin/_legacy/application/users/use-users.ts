'use client'

import { useState, useEffect, useCallback } from 'react'
import { userRepository } from '@/infrastructure/repositories/mock-user-repository'
import type { User, UserStatus } from '@/domain/entities/user'

export function useUsers() {
	const [users, setUsers] = useState<User[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		userRepository.getAll().then(data => {
			setUsers(data)
			setIsLoading(false)
		})
	}, [])

	const updateStatus = useCallback(async (id: number, status: UserStatus) => {
		await userRepository.updateStatus(id, status)
		setUsers(prev => prev.map(u => (u.id === id ? { ...u, status } : u)))
	}, [])

	return { users, isLoading, updateStatus }
}

export function useUser(id: number) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		userRepository.getById(id).then(data => {
			setUser(data)
			setIsLoading(false)
		})
	}, [id])

	return { user, isLoading }
}
