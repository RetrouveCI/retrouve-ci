// Answered as a 429, and read on the form the visitor was filling, hence a
// French message carried by the limit itself. The delay travels with the error:
// asking a counter for it would spend a hit to read a refusal.
export class AccountBudgetExceededError extends Error {
	readonly retryAfterSeconds: number

	constructor(message: string, retryAfterSeconds: number) {
		super(message)
		this.name = 'AccountBudgetExceededError'
		this.retryAfterSeconds = retryAfterSeconds
	}
}
