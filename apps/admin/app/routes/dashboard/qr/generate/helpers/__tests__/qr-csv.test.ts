import { tokensToCsv } from '../qr-csv'
import type { QrToken } from '../../../types/qr.types'

function makeToken(overrides: Partial<QrToken> = {}): QrToken {
	return {
		id: 'tok-1',
		code: 'RCI-0001',
		status: 'generated',
		batch: 'Batch-Juillet-2026',
		label: null,
		linkedObject: null,
		userId: null,
		createdAt: '2026-08-20T10:00:00.000Z',
		activatedAt: null,
		revokedAt: null,
		...overrides,
	}
}

describe('tokensToCsv', () => {
	it('writes the header even when there is no token', () => {
		expect(tokensToCsv([])).toBe('code,batch,status,createdAt')
	})

	it('writes one row per token, in the header order', () => {
		const csv = tokensToCsv([
			makeToken(),
			makeToken({ id: 'tok-2', code: 'RCI-0002', status: 'activated' }),
		])

		expect(csv.split('\n')).toEqual([
			'code,batch,status,createdAt',
			'RCI-0001,Batch-Juillet-2026,generated,2026-08-20T10:00:00.000Z',
			'RCI-0002,Batch-Juillet-2026,activated,2026-08-20T10:00:00.000Z',
		])
	})

	it('leaves the batch cell empty when the token has none', () => {
		expect(tokensToCsv([makeToken({ batch: null })])).toContain(
			'RCI-0001,,generated,',
		)
	})

	it('quotes a batch holding a comma, so the row keeps its four cells', () => {
		const csv = tokensToCsv([makeToken({ batch: 'Abidjan, Plateau' })])

		expect(csv.split('\n')[1]).toBe(
			'RCI-0001,"Abidjan, Plateau",generated,2026-08-20T10:00:00.000Z',
		)
	})

	it('doubles a quote inside a quoted cell', () => {
		const csv = tokensToCsv([makeToken({ batch: 'Lot "spécial"' })])

		expect(csv.split('\n')[1]).toBe(
			'RCI-0001,"Lot ""spécial""",generated,2026-08-20T10:00:00.000Z',
		)
	})

	it('quotes a batch holding a newline', () => {
		const csv = tokensToCsv([makeToken({ batch: 'Lot\nsuivant' })])

		expect(csv).toBe(
			'code,batch,status,createdAt\n' +
				'RCI-0001,"Lot\nsuivant",generated,2026-08-20T10:00:00.000Z',
		)
	})
})
