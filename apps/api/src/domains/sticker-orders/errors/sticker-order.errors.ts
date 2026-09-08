import { NotFoundError, ValidationError } from '@/shared/errors/domain.error'
import { MAX_OPEN_STICKER_ORDERS } from '../constants'

export class StickerOrderNotFoundError extends NotFoundError {
	constructor(id: string) {
		super(`Sticker order with id "${id}" not found`)
	}
}

// No field: the refusal belongs to the order and to none of its inputs, so the
// front renders it with `FormRootError` rather than under a control.
export class TooManyOpenStickerOrdersError extends ValidationError {
	constructor() {
		super(
			`Vous avez déjà ${MAX_OPEN_STICKER_ORDERS} commandes en cours. Attendez leur livraison avant d’en passer une nouvelle.`,
		)
	}
}
