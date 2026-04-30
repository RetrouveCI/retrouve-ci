'use client'

import { useState, useEffect, useCallback } from 'react'
import { eventRepository } from '@/infrastructure/repositories/mock-event-repository'
import type { Event, Activity } from '@/domain/entities/event'

export function useEvents() {
	const [events, setEvents] = useState<Event[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		eventRepository.getAll().then(data => {
			setEvents(data)
			setIsLoading(false)
		})
	}, [])

	const refresh = useCallback(async () => {
		setIsLoading(true)
		await new Promise(r => setTimeout(r, 500))
		const data = await eventRepository.getAll()
		setEvents(data)
		setIsLoading(false)
	}, [])

	return { events, isLoading, refresh }
}

export function useRecentActivities(limit = 10) {
	const [activities, setActivities] = useState<Activity[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		eventRepository.getRecentActivities(limit).then(data => {
			setActivities(data)
			setIsLoading(false)
		})
	}, [limit])

	return { activities, isLoading }
}
