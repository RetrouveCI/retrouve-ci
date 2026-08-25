import { BadRequestException, type PipeTransform } from '@nestjs/common'
import { z, type ZodType } from 'zod'

export class ZodValidationPipe<
	TSchema extends ZodType,
> implements PipeTransform {
	constructor(private readonly schema: TSchema) {}

	transform(value: unknown): z.output<TSchema> {
		const result = this.schema.safeParse(value)

		if (!result.success) {
			throw new BadRequestException({
				message: 'Validation failed',
				errors: z.flattenError(result.error).fieldErrors,
			})
		}

		return result.data
	}
}
