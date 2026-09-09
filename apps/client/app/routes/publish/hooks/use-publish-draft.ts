import { useEffect, useRef, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import {
	clearPublishDraft,
	hasDraftContent,
	readPublishDraft,
	writePublishDraft,
} from '../helpers/publish-draft'
import type { PublishFormData, PublishFormInput } from '../publish.schema'
import { STEP_COUNT } from './use-publish-steps'

interface UsePublishDraftOptions {
	form: UseFormReturn<PublishFormInput, unknown, PublishFormData>
	step: number
	onRestoreStep: (step: number) => void
	/** What the page opened with, so it does not read as a draft on its own. */
	prefilled: Partial<PublishFormInput>
}

/**
 * Keeps the three steps alive across an interrupted session — an incoming call
 * is enough to tear the page down, and eight fields with it.
 *
 * Reading happens in an effect rather than in `defaultValues`: the server
 * renders the form empty, so filling it before hydration would make the two
 * trees disagree.
 */
export function usePublishDraft({
	form,
	step,
	onRestoreStep,
	prefilled,
}: UsePublishDraftOptions) {
	const [isRestored, setIsRestored] = useState(false)
	const [hasDraft, setHasDraft] = useState(false)
	const isStoppedRef = useRef(false)

	useEffect(() => {
		const draft = readPublishDraft(STEP_COUNT)

		if (draft) {
			form.reset({ ...form.getValues(), ...draft.values })
			onRestoreStep(draft.step)
			setHasDraft(true)
		}

		setIsRestored(true)
		// Restoring is a one-shot: every later write belongs to the effect below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!isRestored) return

		const persist = (values: Partial<PublishFormInput>) => {
			if (isStoppedRef.current || !hasDraftContent(values, prefilled)) return

			writePublishDraft({ values, step })
			setHasDraft(true)
		}

		persist(form.getValues())
		const subscription = form.watch(values => persist(values))

		return () => subscription.unsubscribe()
	}, [form, isRestored, prefilled, step])

	return {
		hasDraft,
		/** Called once the listing exists: the draft has served its purpose. */
		discard: () => {
			isStoppedRef.current = true
			setHasDraft(false)
			clearPublishDraft()
		},
	}
}
