import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router'
import { FormRootError } from '@app/ui/components/form'
import type { LostItemType } from '@/shared/types/lost-item'
import { usePublishDraft } from '../hooks/use-publish-draft'
import { usePublishForm } from '../hooks/use-publish-form'
import { firstInvalidStep, usePublishSteps } from '../hooks/use-publish-steps'
import { PUBLISH_ACCENT } from '../publish.const'
import { ContactStep } from './contact-step'
import { ObjectStep } from './object-step'
import { PlaceStep } from './place-step'
import { PublishActionBar } from './publish-action-bar'
import { PublishHeader } from './publish-header'

/**
 * The three screens `/publish/lost` and `/publish/found` share. One form, one
 * request body: the steps only decide what is on screen and what has to be
 * valid before moving on.
 */
export function PublishFlow({ type }: { type: LostItemType }) {
	const { form, onSubmit, isSubmitting } = usePublishForm()
	const { step, goTo, goNext, goBack, isLastStep } = usePublishSteps(form)
	const { hasDraft, discard } = usePublishDraft({
		form,
		step,
		onRestoreStep: goTo,
	})
	const [photoCount, setPhotoCount] = useState(0)

	const accent = PUBLISH_ACCENT[type]
	const { errors } = form.formState
	const navigation = useNavigation()
	const target = navigation.location?.pathname

	// The action answers with a redirect to « Mes annonces »; that is the only
	// point at which the draft has certainly done its job.
	useEffect(() => {
		if (target?.startsWith('/account/posts')) discard()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [target])

	// A message from the API can belong to a field two screens back, and a step
	// nobody can see cannot show it.
	useEffect(() => {
		const invalid = firstInvalidStep(errors)
		if (invalid !== null && invalid < step) goTo(invalid)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [errors, step])

	return (
		<div className="bg-background flex min-h-dvh flex-col">
			<PublishHeader
				step={step}
				segmentClass={accent.segment}
				onBack={goBack}
			/>

			<form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
				<div className="mx-auto w-full max-w-2xl flex-1 pt-5 pr-[max(1rem,env(safe-area-inset-right))] pb-7 pl-[max(1rem,env(safe-area-inset-left))]">
					<FormRootError message={errors.root?.message} />

					{/* Every step stays mounted. The photo picker holds its files in
					    real `<input type="file">` elements and only the DOM can carry
					    them, so unmounting step 1 would drop the photos before step 3
					    submits the form. */}
					<div hidden={step !== 1}>
						<ObjectStep
							control={form.control}
							type={type}
							onPhotoCountChange={setPhotoCount}
						/>
					</div>

					<div hidden={step !== 2}>
						<PlaceStep control={form.control} type={type} />
					</div>

					<div hidden={step !== 3}>
						<ContactStep control={form.control} photoCount={photoCount} />
					</div>
				</div>

				<PublishActionBar
					step={step}
					isLastStep={isLastStep}
					isSubmitting={isSubmitting}
					hasDraft={hasDraft}
					fillClass={accent.fill}
					onBack={goBack}
					onNext={() => void goNext()}
				/>
			</form>
		</div>
	)
}
