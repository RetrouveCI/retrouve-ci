import { Injectable, Logger } from '@nestjs/common'
import { formatPrice } from '@app/contracts/sticker-orders'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { notifyUser } from '@/domains/notifications/helpers/notify'
import type { UserNotificationType } from '@/domains/notifications/types/notification.types'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireStickerOrder } from '../helpers/require-sticker-order'
import { StickerOrderRepository } from '../repository/sticker-order.repository'
import type {
	StickerOrder,
	StickerOrderStatus,
} from '../types/sticker-order.types'

interface UpdateStickerOrderStatusInput {
	id: string
	status: StickerOrderStatus
}

interface StatusNotice {
	type: UserNotificationType
	title: (order: StickerOrder) => string
	message: (order: StickerOrder) => string
	link: string
}

@Injectable()
export class UpdateStickerOrderStatusUseCase implements IDomainUseCase<
	UpdateStickerOrderStatusInput,
	StickerOrder
> {
	private readonly logger = new Logger(UpdateStickerOrderStatusUseCase.name)

	constructor(
		private readonly repository: StickerOrderRepository,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute({
		id,
		status,
	}: UpdateStickerOrderStatusInput): Promise<StickerOrder> {
		const before = await requireStickerOrder(this.repository, id)
		const order = await this.repository.updateStatus(id, status)

		// On the transition alone: a backoffice that saves the same status again
		// must not tell the buyer twice.
		if (status !== before.status) {
			await this.notify(order)
		}

		return order
	}

	private async notify(order: StickerOrder): Promise<void> {
		const notice = NOTICES[order.status]
		if (!notice) return

		await notifyUser(this.createNotification, this.logger, {
			type: notice.type,
			title: notice.title(order),
			message: notice.message(order),
			link: notice.link,
			userId: order.userId,
		})
	}
}

// A lone sticker takes a singular verb, so the subject carries its own.
const packOf = (order: StickerOrder) =>
	order.quantity === 1
		? { subject: 'Votre sticker', verb: 'est' }
		: { subject: `Vos ${order.quantity} stickers`, verb: 'sont' }

// `pending` says nothing on purpose: the desk heard about it through
// `order_placed`, and the buyer has just placed the order. ⚠️ The shipping
// notice names the cash, since a pack is paid to the courier (R59).
const NOTICES: Record<StickerOrderStatus, StatusNotice | null> = {
	pending: null,
	processing: {
		type: 'order_processing',
		title: () => 'Votre commande est en préparation',
		message: order => {
			const { subject, verb } = packOf(order)

			return `${subject} ${verb} en cours de préparation. Vous serez prévenu au départ du colis.`
		},
		link: '/account/orders',
	},
	shipped: {
		type: 'order_shipped',
		title: () => 'Votre commande est en route',
		message: order => {
			const { subject, verb } = packOf(order)

			return `${subject} ${verb} en route. Prévoyez ${formatPrice(order.total)} FCFA en espèces pour le coursier.`
		},
		link: '/account/orders',
	},
	// Unchanged wording: it has spoken to buyers since R15.
	delivered: {
		type: 'stickers_delivered',
		title: order =>
			order.quantity === 1
				? 'Votre sticker est arrivé'
				: 'Vos stickers sont arrivés',
		message: order =>
			order.quantity === 1
				? 'Scannez-le pour lui donner un nom.'
				: `${order.quantity} stickers à activer. Scannez-les un par un, comptez une minute.`,
		link: '/scan',
	},
	cancelled: {
		type: 'order_cancelled',
		title: () => 'Votre commande est annulée',
		message: order =>
			`La commande ${order.orderNumber} a été annulée. Aucun coursier ne passera, et rien ne vous sera facturé.`,
		link: '/account/orders',
	},
}
