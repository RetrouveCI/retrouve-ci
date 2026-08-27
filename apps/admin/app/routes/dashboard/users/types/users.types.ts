/** No API domain backs users, so this list is the contract. */
export const USER_STATUSES = ['active', 'inactive'] as const

export type UserStatus = (typeof USER_STATUSES)[number]

export interface User {
	id: string
	name: string
	email: string
	phone: string | null
	avatar: string | null
	status: UserStatus
	createdAt: string
}
