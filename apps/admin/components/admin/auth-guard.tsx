'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function AuthGuard({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace('/admin/login')
		}
	}, [user, isLoading, router])

	if (isLoading) {
		return (
			<div className="bg-background flex h-screen items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
			</div>
		)
	}

	if (!user) {
		// Évite un flash de contenu pendant la redirection
		return null
	}

	return <>{children}</>
}
