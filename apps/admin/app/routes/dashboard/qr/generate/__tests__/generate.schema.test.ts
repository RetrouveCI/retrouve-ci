import { MAX_GENERATE_COUNT } from '@app/contracts/qr-codes'
import { generateQrPayloadSchema, generateQrSchema } from '../generate.schema'

describe('generateQrSchema', () => {
	it('coerces the quantity the Select holds as a string into a number', () => {
		const result = generateQrSchema.safeParse({
			count: '250',
			batch: '',
			exportCSV: true,
		})

		expect(result.success).toBe(true)
		expect(result.data?.count).toBe(250)
	})

	// The form used to allow 1000 and offer a 1000 button, which the API refused
	// with a 400. The bound is the contract's now, and it is 500.
	it('rejects a quantity the API would refuse', () => {
		const tooMany = generateQrSchema.safeParse({
			count: String(MAX_GENERATE_COUNT + 1),
			exportCSV: true,
		})
		const none = generateQrSchema.safeParse({ count: '0', exportCSV: true })

		expect(MAX_GENERATE_COUNT).toBe(500)
		expect(tooMany.error?.issues[0]?.message).toBe('Maximum 500')
		expect(none.error?.issues[0]?.message).toBe('Minimum 1')
		expect(
			generateQrSchema.safeParse({
				count: String(MAX_GENERATE_COUNT),
				exportCSV: true,
			}).success,
		).toBe(true)
	})

	it('rejects a fractional quantity', () => {
		expect(
			generateQrSchema.safeParse({ count: '2.5', exportCSV: true }).success,
		).toBe(false)
	})

	it('rejects a batch name over 60 characters', () => {
		const result = generateQrSchema.safeParse({
			count: '100',
			batch: 'B'.repeat(61),
			exportCSV: true,
		})

		expect(result.error?.issues[0]?.message).toBe('Maximum 60 caractères')
	})
})

describe('generateQrPayloadSchema', () => {
	it('drops the export choice, which never leaves the browser', () => {
		const result = generateQrPayloadSchema.safeParse({
			count: '100',
			batch: 'Batch-Juillet-2026',
			exportCSV: 'true',
		})

		expect(result.data).toEqual({ count: 100, batch: 'Batch-Juillet-2026' })
	})

	it('accepts a payload with no batch name', () => {
		expect(generateQrPayloadSchema.safeParse({ count: '10' }).data).toEqual({
			count: 10,
		})
	})

	it('rejects a missing quantity', () => {
		expect(generateQrPayloadSchema.safeParse({}).success).toBe(false)
	})
})
