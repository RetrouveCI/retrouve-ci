import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { page, render, userEvent } from '@/shared/helpers/testing'
import { TableDensityProvider } from '@/context/table-density'
import { DataTable } from '../data-table'

interface Row {
	id: string
	title: string
}

const rows: Row[] = [
	{ id: 'a', title: 'iPhone perdu' },
	{ id: 'b', title: 'Sac retrouvé' },
	{ id: 'c', title: 'Clés perdues' },
]

const columns: ColumnDef<Row>[] = [{ accessorKey: 'title', header: 'Titre' }]

function renderTable(initial: string[] = []) {
	const seen: string[][] = []

	function Harness() {
		const [selected, setSelected] = useState(initial)

		return (
			<DataTable
				columns={columns}
				data={rows}
				selection={{
					selected,
					onChange: next => {
						seen.push(next)
						setSelected(next)
					},
					idOf: row => row.id,
					label: row => `Sélectionner « ${row.title} »`,
				}}
			/>
		)
	}

	render(
		<TableDensityProvider initial="normale">
			<Harness />
		</TableDensityProvider>,
	)

	return { seen }
}

const headerBox = () =>
	page.getByRole('checkbox', { name: 'Tout sélectionner sur cette page' })
const rowBox = (title: string) =>
	page.getByRole('checkbox', { name: `Sélectionner « ${title} »` })

describe('DataTable selection', () => {
	it('gives every row a box, named after it', async () => {
		renderTable()

		await expect.element(rowBox('iPhone perdu')).toBeVisible()
		expect(page.getByRole('checkbox').elements()).toHaveLength(rows.length + 1)
	})

	it('ticks and unticks one row', async () => {
		const { seen } = renderTable()

		await userEvent.click(rowBox('Sac retrouvé'))
		expect(seen.at(-1)).toEqual(['b'])

		await userEvent.click(rowBox('Sac retrouvé'))
		expect(seen.at(-1)).toEqual([])
	})

	// The header box ticks the page, because a batch acts on what was looked at.
	it('ticks every row of the page at once', async () => {
		const { seen } = renderTable()

		await userEvent.click(headerBox())

		expect(seen.at(-1)).toEqual(['a', 'b', 'c'])
	})

	it('drops the page’s rows without touching the rest', async () => {
		const { seen } = renderTable(['a', 'b', 'c', 'elsewhere'])

		await userEvent.click(headerBox())

		expect(seen.at(-1)).toEqual(['elsewhere'])
	})

	// It must never claim more than it holds.
	it('reads as indeterminate when only some rows are ticked', async () => {
		renderTable(['a'])

		await expect
			.element(headerBox())
			.toHaveAttribute('data-state', 'indeterminate')
	})

	it('reads as checked once the whole page is ticked', async () => {
		renderTable(['a', 'b', 'c'])

		await expect.element(headerBox()).toHaveAttribute('data-state', 'checked')
	})

	it('offers no box at all when the page does not select', async () => {
		render(
			<TableDensityProvider initial="normale">
				<DataTable columns={columns} data={rows} />
			</TableDensityProvider>,
		)

		expect(page.getByRole('checkbox').elements()).toEqual([])
	})
})
