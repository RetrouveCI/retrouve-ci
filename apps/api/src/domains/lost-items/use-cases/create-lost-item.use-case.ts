import { Injectable, Logger } from '@nestjs/common'
import { LinkQrTokenToLostItemUseCase } from '@/domains/qr-codes/use-cases/link-qr-token-to-lost-item.use-case'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { notifyDesk } from '@/domains/notifications/helpers/notify'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { CreateLostItemData, LostItem } from '../types/lost-item.types'

@Injectable()
export class CreateLostItemUseCase implements IDomainUseCase<
	CreateLostItemData,
	LostItem
> {
	private readonly logger = new Logger(CreateLostItemUseCase.name)

	constructor(
		private readonly repository: LostItemRepository,
		private readonly linkQrToken: LinkQrTokenToLostItemUseCase,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute({
		stickerCode,
		...data
	}: CreateLostItemData): Promise<LostItem> {
		const lostItem = await this.repository.create(data)

		if (stickerCode) {
			await this.link(stickerCode, data.userId, lostItem.id)
		}

		// A listing is created PENDING, and publication is the only moment
		// matching runs — so until the desk acts, the listing is invisible and no
		// match is looked for. Nothing told the desk before this.
		await notifyDesk(this.createNotification, this.logger, {
			type: 'listing_pending',
			title: 'Une annonce attend la modération',
			message: `« ${lostItem.title} » vient d'être déposée et n'est pas encore visible.`,
			link: '/posts?status=pending',
		})

		return lostItem
	}

	/**
	 * A refused link never fails the publication: the form offers only the
	 * poster's own stickers, so a refusal means a forged body. A warning, then,
	 * precisely because it is not a hiccup.
	 */
	private async link(
		code: string,
		userId: string,
		lostItemId: string,
	): Promise<void> {
		try {
			await this.linkQrToken.execute({ code, userId, lostItemId })
		} catch (error) {
			this.logger.warn(
				`Sticker ${code} not linked to lost item ${lostItemId} for user ${userId}: ${String(error)}`,
			)
		}
	}
}
