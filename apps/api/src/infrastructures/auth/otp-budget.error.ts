// better-auth awaits `sendOTP`, so this fails the request; the message reaches
// the caller, hence French.
export class OtpBudgetExceededError extends Error {
	constructor() {
		super(
			'Trop de codes demandés pour ce numéro. Merci de patienter quelques minutes.',
		)
		this.name = 'OtpBudgetExceededError'
	}
}
