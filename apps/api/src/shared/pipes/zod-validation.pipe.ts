import { BadRequestException, type PipeTransform } from '@nestjs/common'
import { z, type ZodType } from 'zod'

/**
 * The fallback for an issue whose schema names no message — in practice the
 * type error a **missing** field raises, which `.min()` never reaches. Five
 * contract domains still leave 25 such fields unnamed, and they answered in
 * English on a French API.
 *
 * It is passed per call rather than set with `z.config()`, deliberately: the
 * zod instance is shared with better-auth, and a global locale would translate
 * its messages too. A message the schema does name still wins — the locale is
 * only consulted for issues that have none.
 */
const localeError = z.locales.fr().localeError

export class ZodValidationPipe<
	TSchema extends ZodType,
> implements PipeTransform {
	constructor(private readonly schema: TSchema) {}

	transform(value: unknown): z.output<TSchema> {
		const result = this.schema.safeParse(value, { error: localeError })

		if (!result.success) {
			throw new BadRequestException({
				message: 'Validation failed',
				errors: z.flattenError(result.error).fieldErrors,
			})
		}

		return result.data
	}
}
