import { randomInt } from 'node:crypto'
import { ORDER_NUMBER_PREFIX } from '../constants'

export function generateOrderNumber(): string {
	const year = new Date().getFullYear()
	const sequence = randomInt(1_000_000).toString().padStart(6, '0')

	return `${ORDER_NUMBER_PREFIX}-${year}-${sequence}`
}
