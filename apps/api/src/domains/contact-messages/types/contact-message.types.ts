import type {
	ContactMessageStatus,
	CreateContactMessageData as CreateContactMessageContract,
	ListContactMessagesFilterData,
} from '@app/contracts/contact-messages'

export type { ContactMessageStatus }

/**
 * A superset of the web form: `qr-codes/:code/contact` creates a message too,
 * with a phone instead of an email and a subject it derives itself. Its own
 * contract lands with that domain's E6 slice.
 */
export type CreateContactMessageData = Partial<CreateContactMessageContract> &
	Pick<CreateContactMessageContract, 'name' | 'message'> & {
		subject: string
		phone?: string
		qrTokenCode?: string
		recipientUserId?: string
	}

export type ListContactMessagesFilter = ListContactMessagesFilterData
