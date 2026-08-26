import { BadRequestException } from '@nestjs/common'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createContactMessageSchema } from '@app/contracts/contact-messages'
import { createLostItemSchema } from '@app/contracts/lost-items'
import { createStickerOrderSchema } from '@app/contracts/sticker-orders'
import { createEventSchema } from '@app/contracts/events'
import { contactOwnerSchema } from '@app/contracts/qr-codes'
import { ZodValidationPipe } from '../zod-validation.pipe'

/** What zod says when nothing else names the issue. */
const ENGLISH =
	/Invalid input|expected|received|Invalid option|Too small|Too big/

function errorsOf(schema: z.ZodType, value: unknown) {
	try {
		new ZodValidationPipe(schema).transform(value)
	} catch (error) {
		const response = (error as BadRequestException).getResponse() as {
			message: string
			errors: Record<string, string[]>
		}
		return response
	}
	throw new Error('expected the pipe to reject')
}

describe('ZodValidationPipe', () => {
	it('returns the transformed output, not the raw input', () => {
		const schema = z.object({ title: z.string().trim() })

		expect(
			new ZodValidationPipe(schema).transform({ title: '  hi  ' }),
		).toEqual({ title: 'hi' })
	})

	it('strips a field the schema does not know', () => {
		const schema = z.object({ title: z.string() })

		expect(
			new ZodValidationPipe(schema).transform({ title: 'hi', role: 'admin' }),
		).toEqual({ title: 'hi' })
	})

	it('answers the documented shape, one entry per field', () => {
		const schema = z.object({ a: z.string(), b: z.string() })

		expect(errorsOf(schema, {})).toEqual({
			message: 'Validation failed',
			errors: {
				a: [expect.any(String)],
				b: [expect.any(String)],
			},
		})
	})

	// The bug this closes: `.min()` is never reached for an absent field, so the
	// type error spoke for it — in English.
	it('reports a missing field in French', () => {
		const { errors } = errorsOf(z.object({ title: z.string() }), {})

		expect(errors.title?.[0]).not.toMatch(ENGLISH)
		expect(errors.title?.[0]).toContain('chaîne')
	})

	it('leaves a message the schema names alone', () => {
		const schema = z.object({
			title: z.string('Le titre est requis').min(2, 'Trop court'),
		})

		expect(errorsOf(schema, {}).errors.title).toEqual(['Le titre est requis'])
		expect(errorsOf(schema, { title: 'x' }).errors.title).toEqual([
			'Trop court',
		])
	})

	/**
	 * The five domains measured as still carrying unnamed type errors. Asserted
	 * on the real contracts rather than a stand-in, since the point is that no
	 * endpoint can answer English again.
	 */
	it.each([
		['contact-messages', createContactMessageSchema],
		['events', createEventSchema],
		['lost-items', createLostItemSchema],
		['qr-codes', contactOwnerSchema],
		['sticker-orders', createStickerOrderSchema],
	])('answers %s an empty body entirely in French', (_domain, schema) => {
		const { errors } = errorsOf(schema, {})
		const messages = Object.values(errors).flat()

		expect(messages.length).toBeGreaterThan(0)
		for (const message of messages) expect(message).not.toMatch(ENGLISH)
	})
})
