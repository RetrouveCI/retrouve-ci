import { MAX_GENERATE_COUNT, MIN_GENERATE_COUNT } from '../constants'
import { InvalidQrTokenError } from '../errors/qr-token.errors'
import type { GenerateQrTokensData } from '../types/qr-token.types'

export function validateGenerateQrTokens(data: GenerateQrTokensData): void {
	if (data.count < MIN_GENERATE_COUNT || data.count > MAX_GENERATE_COUNT) {
		throw new InvalidQrTokenError(
			`Le nombre de codes à générer doit être compris entre ${MIN_GENERATE_COUNT} et ${MAX_GENERATE_COUNT}`,
		)
	}
}
