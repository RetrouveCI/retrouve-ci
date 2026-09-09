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

// French, and on the `code` field: the activation dialog reads this sentence,
// often, and the code is on screen already.
export class QrTokenAlreadyActivatedError extends ValidationError {
	constructor() {
		super('Ce sticker est déjà activé', 'code')
	}
}

/**
 * The only domain error here whose message is French: it is answered to an
 * anonymous finder on a public form, and the filter sends `message` straight
 * to the browser. Moving this rule out of the controller must not change what
 * that visitor reads.
 */
export class QrTokenNotActivatedError extends ValidationError {
	constructor() {
		super("Ce sticker n'est pas encore activé")
	}
}

/** French like its neighbour, and a 403: the request is well formed, the owner said no. */
export class QrTokenDirectContactRefusedError extends ForbiddenError {
	constructor() {
		super(
			"Le propriétaire de ce sticker n'accepte pas d'être joint directement",
		)
	}
}

/** `user.phoneNumber` is nullable, so this is an ordinary state, not a bug. */
export class QrTokenOwnerUnreachableError extends ValidationError {
	constructor() {
		super("Le propriétaire de ce sticker n'a pas de numéro joignable")
	}
}

export class QrTokenRevokedError extends ValidationError {
	constructor() {
		super('Ce sticker a été désactivé et ne peut plus être activé', 'code')
	}
}

export class QrTokenForbiddenError extends ForbiddenError {
	constructor(code: string) {
		super(`You are not allowed to modify QR token "${code}"`)
	}
}
