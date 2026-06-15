import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import type { LostItem, LostItemType } from '@/shared/types/lost-item'

interface MatchingSuggestionsParams {
	objectType: string
	ville: string
	formType: 'perdu' | 'retrouve'
}

interface MatchingSuggestionsResult {
	matches: LostItem[]
	isLoading: boolean
}

export function useMatchingSuggestions({
	objectType,
	ville,
	formType,
}: MatchingSuggestionsParams): MatchingSuggestionsResult {
	const fetcher = useFetcher<{ items: LostItem[] }>()

	useEffect(() => {
		if (!objectType || !ville) return

		const targetType: LostItemType = formType === 'perdu' ? 'found' : 'lost'
		const params = new URLSearchParams({
			type: targetType,
			category: objectType,
			ville,
		})
		fetcher.load(`/publish/matches?${params}`)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [objectType, ville, formType])

	if (!objectType || !ville) {
		return { matches: [], isLoading: false }
	}

	return {
		matches: fetcher.data?.items ?? [],
		isLoading: fetcher.state === 'loading',
	}
}
