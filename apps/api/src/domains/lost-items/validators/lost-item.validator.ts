import { InvalidLostItemError } from '../errors/lost-item.errors'
import { MAX_PHOTOS, MIN_DESCRIPTION_LENGTH } from '../constants'
import type { CreateLostItemData } from '../types/lost-item.types'

export function validateCreateLostItem(data: CreateLostItemData): void {
	if (data.description.trim().length < MIN_DESCRIPTION_LENGTH) {
		throw new InvalidLostItemError(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
	}

	if (data.photos && data.photos.length > MAX_PHOTOS) {
		throw new InvalidLostItemError(
			`Vous ne pouvez pas ajouter plus de ${MAX_PHOTOS} photos`,
		)
	}
}
