import { useState } from 'react'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import { DateChoice } from '../date-choice'

function isoDay(daysAgo: number) {
	const date = new Date()
	date.setDate(date.getDate() - daysAgo)
	const month = String(date.getMonth() + 1).padStart(2, '0')

	return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`
}

function Harness({ initial = '' }: { initial?: string }) {
	const [value, setValue] = useState(initial)

	return (
		<>
			<DateChoice
				id="date"
				value={value}
				onChange={setValue}
				onBlur={() => undefined}
				invalid={false}
			/>
			<p>Valeur : {value || '—'}</p>
		</>
	)
}

const shortcut = (name: string) => page.getByRole('button', { name })

afterEach(() => {
	cleanup()
})

describe('the date shortcuts', () => {
	// Nearly every listing is posted the day of the loss or the day after, and
	// the native picker asks for three taps to say so.
	it.each([
		["Aujourd'hui", 0],
		['Hier', 1],
	])('writes the day %s stands for', async (label, daysAgo) => {
		render(<Harness />)
		await userEvent.click(shortcut(label))

		await expect
			.element(page.getByText(`Valeur : ${isoDay(daysAgo)}`))
			.toBeVisible()
	})

	it('asks for a picker only when neither shortcut fits', async () => {
		render(<Harness />)

		expect(document.getElementById('date')).toBeNull()

		await userEvent.click(shortcut('Autre date'))

		expect(document.getElementById('date')).not.toBeNull()
		await expect.element(page.getByText('Valeur : —')).toBeVisible()
	})

	// A restored draft arrives as a bare date; the shortcut it matches has to
	// light up on its own, or the poster is told nothing is chosen.
	it('lights the shortcut a restored date matches', async () => {
		render(<Harness initial={isoDay(1)} />)

		await expect
			.element(shortcut('Hier'))
			.toHaveAttribute('aria-pressed', 'true')
		await expect
			.element(shortcut("Aujourd'hui"))
			.toHaveAttribute('aria-pressed', 'false')
	})
})
