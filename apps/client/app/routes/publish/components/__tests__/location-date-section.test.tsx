import { createRoutesStub } from 'react-router'
import { useForm } from 'react-hook-form'
import { cleanup, page, render, stopAnimations } from '@/shared/helpers/testing'
import type { PublishFormInput } from '../../publish.schema'
import { LocationDateSection } from '../location-date-section'

function Harness() {
	const form = useForm<PublishFormInput>({
		defaultValues: { ville: 'Abidjan', commune: 'Cocody' },
	})

	return (
		<LocationDateSection
			control={form.control}
			dateLabel="Date de perte"
			sectionTitle="Lieu & date"
			accentColor="var(--accent-orange)"
		/>
	)
}

beforeEach(() => {
	stopAnimations()
})

afterEach(() => {
	cleanup()
})

// Picking a city clears the commune, and Radix answers `onValueChange` once on
// its own as a controlled `Select` mounts — the pair that emptied the two
// fields of a restored publish draft. A listing opened for editing arrives with
// its city already set, which is the case that must stay untouched.
it('keeps the commune a saved listing already carries', async () => {
	const Stub = createRoutesStub([{ path: '/', Component: Harness }])
	render(<Stub initialEntries={['/']} />)

	await expect.element(page.getByText('Cocody')).toBeVisible()
})
