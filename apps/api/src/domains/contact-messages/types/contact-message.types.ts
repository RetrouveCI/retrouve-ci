import type {
	ContactMessageStatus,
	CreateContactMessageData as CreateContactMessageContract,
	ListContactMessagesFilterData,
} from '@app/contracts/contact-messages'
import type { ContactOwnerData } from '@app/contracts/qr-codes'

export type { ContactMessageStatus }

/**
 * Two entry points land here. The web form posts an email and its own subject; a
 * QR scan posts the finder's phone, derives the subject from the sticker, and
 * names the sticker and its owner.
 */
export type CreateContactMessageData = Pick<
	CreateContactMessageContract,
	'name' | 'subject' | 'message'
> &
	Partial<Pick<CreateContactMessageContract, 'email'>> &
	Partial<Pick<ContactOwnerData, 'phone'>> & {
		qrTokenCode?: string
		recipientUserId?: string
	}

export type ListContactMessagesFilter = ListContactMessagesFilterData
