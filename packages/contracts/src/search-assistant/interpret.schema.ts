import { z } from 'zod'
import { calendarDateSchema } from '../shared/calendar-date'
import { abidjanCommuneSchema, villeSchema } from '../shared/locations'
import { listSearchSchema } from '../shared/pagination'
import {
	lostItemCategorySchema,
	lostItemTypeSchema,
} from '../lost-items/enums.schema'
import {
	PHRASE_MAX_LENGTH,
	PHRASE_MIN_LENGTH,
	SEARCH_INTERPRETATION_STATUSES,
} from './search-assistant.const'

export const interpretSearchPhraseSchema = z.object({
	phrase: z
		.string({ error: 'La phrase est requise' })
		.trim()
		.min(PHRASE_MIN_LENGTH, `Au moins ${PHRASE_MIN_LENGTH} caractères`)
		.max(PHRASE_MAX_LENGTH, `Maximum ${PHRASE_MAX_LENGTH} caractères`),
})

/**
 * A **strict subset** of `listLostItemsFilterSchema`: every field the assistant
 * may answer is one the listing search already takes, so an interpretation
 * needs no translation on its way to the list. Nothing here identifies a
 * listing — the model is never shown one, so it cannot name one.
 */
export const assistantSearchFiltersSchema = z.object({
	type: lostItemTypeSchema.optional(),
	category: lostItemCategorySchema.optional(),
	ville: villeSchema.optional(),
	commune: abidjanCommuneSchema.optional(),
	search: listSearchSchema.min(1).optional(),
	dateFrom: calendarDateSchema({
		required: 'Date de début requise',
		invalid: 'Date de début invalide',
	}).optional(),
	dateTo: calendarDateSchema({
		required: 'Date de fin requise',
		invalid: 'Date de fin invalide',
	}).optional(),
})

export const searchInterpretationSchema = z.object({
	status: z.enum(SEARCH_INTERPRETATION_STATUSES, {
		error: 'Statut invalide',
	}),
	filters: assistantSearchFiltersSchema,
})

export type InterpretSearchPhraseInput = z.input<
	typeof interpretSearchPhraseSchema
>
export type InterpretSearchPhraseData = z.output<
	typeof interpretSearchPhraseSchema
>
export type AssistantSearchFilters = z.output<
	typeof assistantSearchFiltersSchema
>
export type SearchInterpretation = z.output<typeof searchInterpretationSchema>
