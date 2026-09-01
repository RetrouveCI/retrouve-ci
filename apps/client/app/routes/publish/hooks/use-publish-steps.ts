import { useState } from 'react'
import type { FieldErrors, UseFormReturn } from 'react-hook-form'
import type { PublishFormData, PublishFormInput } from '../publish.schema'

export const STEP_COUNT = 3

/**
 * Which fields each step owns. Moving on runs `trigger` over these alone, so a
 * contact field left empty never blocks the first screen — and the three lists
 * together are the whole schema, which is what lets a server-side error be
 * traced back to the step that can show it.
 */
const STEP_FIELDS: readonly (readonly (keyof PublishFormInput)[])[] = [
	['title', 'objectType', 'description'],
	['ville', 'commune', 'date'],
	['name', 'whatsapp'],
]

export function firstInvalidStep(
	errors: FieldErrors<PublishFormInput>,
): number | null {
	const index = STEP_FIELDS.findIndex(fields =>
		fields.some(field => errors[field] !== undefined),
	)

	return index === -1 ? null : index + 1
}

export function usePublishSteps(
	form: UseFormReturn<PublishFormInput, unknown, PublishFormData>,
) {
	const [step, setStep] = useState(1)

	const goTo = (next: number) => {
		setStep(Math.min(Math.max(next, 1), STEP_COUNT))
		// A step swaps the page's whole body while the action bar stays put, so
		// nothing else tells the reader they have moved.
		window.scrollTo({ top: 0 })
	}

	const goNext = async () => {
		const fields = STEP_FIELDS[step - 1] ?? []
		const isValid = await form.trigger([...fields])

		if (isValid) goTo(step + 1)
	}

	return {
		step,
		goTo,
		goNext,
		goBack: () => goTo(step - 1),
		isLastStep: step === STEP_COUNT,
	}
}
