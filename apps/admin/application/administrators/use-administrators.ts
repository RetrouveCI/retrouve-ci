'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminRepository } from '@/infrastructure/repositories/mock-admin-repository'
import type { Admin, AdminStatus } from '@/domain/entities/admin'
import type { CreateAdminDto } from '@/domain/repositories/admin-repository'

export function useAdministrators() {
	const [admins, setAdmins] = useState<Admin[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		adminRepository.getAll().then(data => {
			setAdmins(data)
			setIsLoading(false)
		})
	}, [])

	const create = useCallback(async (data: CreateAdminDto) => {
		const newAdmin = await adminRepository.create(data)
		setAdmins(prev => [...prev, newAdmin])
		return newAdmin
	}, [])

	const update = useCallback(
		async (id: number, data: Partial<CreateAdminDto>) => {
			const updated = await adminRepository.update(id, data)
			setAdmins(prev => prev.map(a => (a.id === id ? updated : a)))
			return updated
		},
		[],
	)

	const updateStatus = useCallback(
		async (id: number, status: AdminStatus) => {
			await adminRepository.updateStatus(id, status)
			setAdmins(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
		},
		[],
	)

	const remove = useCallback(async (id: number) => {
		await adminRepository.delete(id)
		setAdmins(prev => prev.filter(a => a.id !== id))
	}, [])

	return { admins, isLoading, create, update, updateStatus, remove }
}
