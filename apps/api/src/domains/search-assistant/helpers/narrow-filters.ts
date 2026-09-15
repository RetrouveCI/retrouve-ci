import {
	assistantSearchFiltersSchema,
	type AssistantSearchFilters,
} from '@app/contracts/search-assistant'
import { COMMUNE_CITY } from '@app/contracts/shared'

/** `{"type":"lost"}` wherever it sits, prose or code fence around it. */
function firstObject(text: string): unknown {
	const start = text.indexOf('{')
	const end = text.lastIndexOf('}')

	if (start === -1 || end <= start) return null

	try {
		return JSON.parse(text.slice(start, end + 1))
	} catch {
		return null
	}
}

/**
 * Field by field, and **dropping** rather than refusing: a model that names one
 * place it invented must not cost the caller the category it got right. This is
 * where the invariant holds — nothing the model writes reaches a query without
 * having matched a value the contract already knows, so a phrase that talks it
 * into answering anything at all buys a filter the visitor could have picked
 * from the form.
 */
export function narrowAssistantFilters(text: string): AssistantSearchFilters {
	const parsed = firstObject(text)

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		return {}
	}

	const filters: Record<string, unknown> = {}

	for (const [key, shape] of Object.entries(
		assistantSearchFiltersSchema.shape,
	)) {
		const value = (parsed as Record<string, unknown>)[key]

		if (value === undefined || value === null) continue

		const result = shape.safeParse(value)

		if (result.success && result.data !== undefined) {
			filters[key] = result.data
		}
	}

	// The commune list belongs to exactly one city, which the contract states —
	// so a commune with no city is completed rather than dropped, and one named
	// beside a different city is a filter that can match nothing.
	if (filters.commune) {
		if (!filters.ville) filters.ville = COMMUNE_CITY
		else if (filters.ville !== COMMUNE_CITY) delete filters.commune
	}

	return filters as AssistantSearchFilters
}
