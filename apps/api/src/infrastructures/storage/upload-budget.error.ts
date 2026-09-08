// Answered as a 429, and read on the poster's publish form, hence French. The
// delay travels with it: asking for it would spend a hit to read a refusal.
export class UploadBudgetExceededError extends Error {
	readonly retryAfterSeconds: number

	constructor(retryAfterSeconds: number) {
		super(
			'Trop de photos envoyées pour ce compte. Merci de patienter avant de réessayer.',
		)
		this.name = 'UploadBudgetExceededError'
		this.retryAfterSeconds = retryAfterSeconds
	}
}
