'use client'

import { useState, useEffect, useCallback } from 'react'
import { listingRepository } from '@/infrastructure/repositories/mock-listing-repository'
import type { ListingFilters } from '@/domain/repositories/listing-repository'
import type { Listing } from '@/domain/entities/listing'

interface UseListingsResult {
	listings: Listing[]
	isLoading: boolean
	refetch: (filters?: ListingFilters) => void
}

export function useListings(initialFilters?: ListingFilters): UseListingsResult {
	const [listings, setListings] = useState<Listing[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const fetch = useCallback((filters?: ListingFilters) => {
		setIsLoading(true)
		listingRepository.getAll(filters).then(data => {
			setListings(data)
			setIsLoading(false)
		})
	}, [])

	useEffect(() => {
		fetch(initialFilters)
		// initialFilters intentionally excluded — callers use refetch for updates
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetch])

	return { listings, isLoading, refetch: fetch }
}
