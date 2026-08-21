/** A send that reached Letexto and was refused, or never reached it at all. */
export class SmsDeliveryError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message)
		this.name = 'SmsDeliveryError'
	}
}

/**
 * A recipient the gateway cannot accept. Distinct from `SmsDeliveryError`
 * because retrying it is pure waste: the number will not become valid.
 */
export class InvalidRecipientError extends Error {
	constructor(readonly phoneNumber: string) {
		super(
			`Unusable recipient "${phoneNumber}": expected the country code 225 followed by 10 digits`,
		)
		this.name = 'InvalidRecipientError'
	}
}
