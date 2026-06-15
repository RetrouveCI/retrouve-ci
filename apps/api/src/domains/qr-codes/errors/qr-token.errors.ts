import {
	ForbiddenError,
	NotFoundError,
	ValidationError,
} from '@/shared/errors/domain.error'

export class QrTokenNotFoundError extends NotFoundError {
	constructor(code: string) {
		super(`QR token "${code}" not found`)
	}
}

export class InvalidQrTokenError extends ValidationError {}

export class QrTokenAlreadyActivatedError extends ValidationError {
	constructor(code: string) {
		super(`QR token "${code}" is already activated`)
	}
}

export class QrTokenRevokedError extends ValidationError {
	constructor(code: string) {
		super(`QR token "${code}" has been revoked`)
	}
}

export class QrTokenForbiddenError extends ForbiddenError {
	constructor(code: string) {
		super(`You are not allowed to modify QR token "${code}"`)
	}
}
