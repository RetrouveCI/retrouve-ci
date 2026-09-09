import { Injectable, Logger } from '@nestjs/common'
import { CreateContactMessageUseCase } from '@/domains/contact-messages/use-cases/create-contact-message.use-case'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { notifyUser } from '@/domains/notifications/helpers/notify'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenNotActivatedError } from '../errors/qr-token.errors'
import { requireQrToken } from '../helpers/require-qr-token'
import { QrTokenRepository } from '../repository/qr-token.repository'

interface ContactQrTokenOwnerInput {
	code: string
	name: string
	phone: string
	email?: string
	message: string
}

@Injectable()
export class ContactQrTokenOwnerUseCase implements IDomainUseCase<
	ContactQrTokenOwnerInput,
	void
> {
	private readonly logger = new Logger(ContactQrTokenOwnerUseCase.name)

	constructor(
		private readonly repository: QrTokenRepository,
		private readonly createContactMessage: CreateContactMessageUseCase,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute({
		code,
		name,
		phone,
		email,
		message,
	}: ContactQrTokenOwnerInput): Promise<void> {
		const token = await requireQrToken(this.repository, code)

		if (token.status !== 'activated' || !token.userId) {
			throw new QrTokenNotActivatedError()
		}

		await this.createContactMessage.execute({
			name,
			email,
			phone,
			subject: `Sticker QR — ${token.label ?? token.code}`,
			message,
			qrTokenCode: token.code,
			recipientUserId: token.userId,
		})

		// The message is recorded by here, so a failing notice must not answer
		// 500 to a finder who would then send it again.
		await notifyUser(this.createNotification, this.logger, {
			type: 'qr_scan',
			title: "Quelqu'un a trouvé votre objet",
			message: `${name} vous a contacté via votre sticker QR.`,
			link: '/account/stickers',
			userId: token.userId,
		})
	}
}
