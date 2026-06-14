import { useMemo } from 'react'
import { MOCK_LISTINGS } from '@/shared/mock/data'
import type { Listing, ListingType } from '@/features/listings/listings.types'
import { TYPE_TO_CATEGORY } from '../publish.const'

interface MatchingSuggestionsParams {
	objectType: string
	ville: string
	commune?: string
	formType: 'perdu' | 'retrouve'
}

export function useMatchingSuggestions({
	objectType,
	ville,
	formType,
}: MatchingSuggestionsParams): Listing[] {
	return useMemo(() => {
		if (!objectType || !ville) return []

		const targetType: ListingType = formType === 'perdu' ? 'found' : 'lost'
		const category = TYPE_TO_CATEGORY[objectType]

		return MOCK_LISTINGS.filter(
			l =>
				l.type === targetType &&
				l.category === category &&
				l.ville?.toLowerCase() === ville.toLowerCase(),
		).slice(0, 4)
	}, [objectType, ville, formType])
}
