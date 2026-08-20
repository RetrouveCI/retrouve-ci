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

	it('rejects a quantity outside 1..1000', () => {
		const tooMany = generateQrSchema.safeParse({
			count: '1001',
			exportCSV: true,
		})
		const none = generateQrSchema.safeParse({ count: '0', exportCSV: true })

		expect(tooMany.error?.issues[0]?.message).toBe('Maximum 1000')
		expect(none.error?.issues[0]?.message).toBe('Minimum 1')
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
