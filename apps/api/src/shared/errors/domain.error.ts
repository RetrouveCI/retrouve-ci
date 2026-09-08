export abstract class DomainError extends Error {
	constructor(message: string) {
		super(message)
		this.name = this.constructor.name
	}
}

export abstract class NotFoundError extends DomainError {}

// `field` is what lands a refusal on the input it concerns rather than in a
// banner. Optional: an error answered to a page with no form has none.
export abstract class ValidationError extends DomainError {
	readonly field?: string

	constructor(message: string, field?: string) {
		super(message)
		this.field = field
	}
}

export abstract class ForbiddenError extends DomainError {}
