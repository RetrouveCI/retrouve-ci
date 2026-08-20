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
