export abstract class DomainError extends Error {
	constructor(message: string) {
		super(message)
		this.name = this.constructor.name
	}
}

export abstract class NotFoundError extends DomainError {}

export abstract class ValidationError extends DomainError {}

export abstract class ForbiddenError extends DomainError {}
