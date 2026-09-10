import { z } from 'zod'
import { NAME_MAX_LENGTH } from '../shared/name'
import { pushLostItemWriteIssues } from './documents.schema'
import { lostItemFieldsSchema } from './create.schema'

/**
 * The name of the person the team published on behalf of. Optional — the team
 * also publishes for objects nobody has claimed yet — and never public: the
 * projection withholds it, and `public-projection.spec.ts` asserts the omission.
 */
export const postedForSchema = z
	.string()
	.trim()
	.max(NAME_MAX_LENGTH, 'Ce nom est trop long')
	.optional()

/**
 * What the backoffice posts. It derives from `lostItemFieldsSchema` rather than
 * from `createLostItemSchema` for two reasons: Zod 4 throws on `.extend()` over
 * a checked object, and a team listing carries no `stickerCode` — a code is
 * resolved against its owner's own tokens, which a system account has none of.
 *
 * Everything else is deliberately identical to the public form. The listing a
 * visitor reads is the same object whoever filed it.
 */
export const createOfficialLostItemSchema = lostItemFieldsSchema
	.extend({ postedFor: postedForSchema })
	.check(ctx => pushLostItemWriteIssues(ctx, { requireHolderName: true }))

export type CreateOfficialLostItemInput = z.input<
	typeof createOfficialLostItemSchema
>
export type CreateOfficialLostItemData = z.output<
	typeof createOfficialLostItemSchema
>
