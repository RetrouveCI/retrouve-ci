import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiQuery } from '@nestjs/swagger'
import { z, type ZodType } from 'zod'

interface OpenApiObjectSchema {
	properties?: Record<string, Record<string, unknown>>
	required?: string[]
}

/**
 * The contract is the only description of a request there is, so `/docs` reads
 * it rather than repeating it: `@ApiProperty` left with the DTOs, and a
 * hand-written `@ApiBody` would drift from the schema the pipe enforces.
 */
export function toOpenApiSchema(schema: ZodType): Record<string, unknown> {
	return z.toJSONSchema(schema, {
		io: 'input',
		target: 'openapi-3.0',
		unrepresentable: 'any',
	}) as Record<string, unknown>
}

export function ApiZodBody(schema: ZodType) {
	return ApiBody({ schema: toOpenApiSchema(schema) })
}

/** A query string is a list of parameters, not a body, so each key gets one. */
export function ApiZodQuery(schema: ZodType) {
	const { properties = {}, required = [] } = toOpenApiSchema(
		schema,
	) as OpenApiObjectSchema

	return applyDecorators(
		...Object.entries(properties).map(([name, property]) =>
			ApiQuery({ name, required: required.includes(name), schema: property }),
		),
	)
}
