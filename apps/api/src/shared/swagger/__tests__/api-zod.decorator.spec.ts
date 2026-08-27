import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { setInitialPasswordSchema } from '@app/contracts/auth'
import { listNotificationsFilterSchema } from '@app/contracts/notifications'
import { createLostItemSchema } from '@app/contracts/lost-items'
import { toOpenApiSchema } from '../api-zod.decorator'

function propertiesOf(schema: Parameters<typeof toOpenApiSchema>[0]) {
	return (toOpenApiSchema(schema) as { properties: Record<string, unknown> })
		.properties
}

describe('toOpenApiSchema', () => {
	it('carries every bound and pattern of the password rule', () => {
		expect(propertiesOf(setInitialPasswordSchema)['newPassword']).toEqual({
			type: 'string',
			minLength: 8,
			maxLength: 128,
			allOf: [
				{ type: 'string', pattern: '[A-Z]' },
				{ type: 'string', pattern: '[a-z]' },
				{ type: 'string', pattern: '[0-9]' },
			],
		})
	})

	it('marks the field required, as the schema does', () => {
		expect(toOpenApiSchema(setInitialPasswordSchema)).toMatchObject({
			type: 'object',
			required: ['newPassword'],
		})
	})

	it('targets OpenAPI 3.0, so it emits no $schema key', () => {
		expect(toOpenApiSchema(setInitialPasswordSchema)).not.toHaveProperty(
			'$schema',
		)
	})

	// A query string carries everything as a string, so its filters are unions —
	// the shape a naive conversion loses.
	it('keeps both arms of a query-string union', () => {
		const properties = propertiesOf(listNotificationsFilterSchema)

		expect(properties['page']).toMatchObject({
			anyOf: [{ type: 'integer' }, { type: 'string', pattern: '^\\d+$' }],
		})
		expect(properties['read']).toEqual({
			anyOf: [{ type: 'boolean' }, { type: 'string', enum: ['true', 'false'] }],
		})
	})

	// Reading the output side would describe `+2250700000000`, not what a client
	// may send.
	it('describes a transformed field by its input', () => {
		expect(propertiesOf(createLostItemSchema)['contactWhatsapp']).toEqual({
			type: 'string',
		})
	})

	it('describes an enum by its values', () => {
		expect(
			propertiesOf(z.object({ status: z.enum(['a', 'b']) }))['status'],
		).toEqual({ type: 'string', enum: ['a', 'b'] })
	})
})
