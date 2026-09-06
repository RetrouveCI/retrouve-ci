import { Injectable, Logger } from '@nestjs/common'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import {
	QrTokenDirectContactRefusedError,
	QrTokenNotActivatedError,
	QrTokenOwnerUnreachableError,
} from '../errors/qr-token.errors'
import { toReachTarget } from '../helpers/reach-target'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { ReachChannel } from '../types/qr-token.types'

interface ReachQrTokenOwnerInput {
	code: string
	channel: ReachChannel
}

interface ReachQrTokenOwnerOutput {
	url: string
}

const CHANNEL_WORDING: Record<ReachChannel, string> = {
	call: 'cherche à vous appeler',
	whatsapp: 'vous écrit sur WhatsApp',
}

/** The jump A8 adds beside the message form: it answers a URL, never a number. */
@Injectable()
export class ReachQrTokenOwnerUseCase implements IDomainUseCase<
	ReachQrTokenOwnerInput,
	ReachQrTokenOwnerOutput
> {
	private readonly logger = new Logger(ReachQrTokenOwnerUseCase.name)

	constructor(
		private readonly repository: QrTokenRepository,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute({
		code,
		channel,
	}: ReachQrTokenOwnerInput): Promise<ReachQrTokenOwnerOutput> {
		const reach = await this.repository.findOwnerReach(code)

		// One answer for both, deliberately: telling them apart says which codes exist.
		if (!reach || reach.status !== 'activated' || !reach.ownerUserId) {
			throw new QrTokenNotActivatedError()
		}

		if (!reach.directContact) {
			throw new QrTokenDirectContactRefusedError()
		}

		const url = toReachTarget(
			reach.ownerPhoneNumber,
			channel,
			whatsappMessage(code, reach.label),
		)

		if (!url) {
			throw new QrTokenOwnerUnreachableError()
		}

		await this.notifyOwner(reach.ownerUserId, reach.label, channel)

		return { url }
	}

	/** The jump is what the finder came for; the trace must not be able to stop it. */
	private async notifyOwner(
		userId: string,
		label: string | null,
		channel: ReachChannel,
	): Promise<void> {
		const object = label ? `« ${label} »` : 'votre objet'

		try {
			await this.createNotification.execute({
				type: 'qr_scan',
				title: "Quelqu'un cherche à vous joindre",
				message: `Une personne a scanné le sticker de ${object} et ${CHANNEL_WORDING[channel]}.`,
				link: '/account/stickers',
				userId,
			})
		} catch (error) {
			this.logger.error(
				`Reach notification for user ${userId} failed: ${String(error)}`,
			)
		}
	}
}

/** Prefilled so the first tap says something; `tel:` carries no message. */
function whatsappMessage(code: string, label: string | null): string {
	const object = label ? `« ${label} »` : 'votre objet'

	return `Bonjour, j'ai trouvé ${object} grâce à son sticker RetrouveCI (${code}).`
}
