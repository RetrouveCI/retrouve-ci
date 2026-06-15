'use client'

import { useState, useEffect } from 'react'
import { dashboardRepository } from '@/infrastructure/repositories/mock-dashboard-repository'
import type { DashboardStats, ChartData } from '@/domain/entities/dashboard'

export function useDashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [chartData, setChartData] = useState<ChartData | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		Promise.all([
			dashboardRepository.getStats(),
			dashboardRepository.getChartData(),
		]).then(([s, c]) => {
			setStats(s)
			setChartData(c)
			setIsLoading(false)
		})
	}, [])

	return { stats, chartData, isLoading }
}
