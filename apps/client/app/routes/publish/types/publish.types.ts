import type { CreateLostItemInput } from '@app/contracts/lost-items'

/** The POST body is the contract's own input; the action does the translating. */
export type CreateLostItemPayload = CreateLostItemInput
