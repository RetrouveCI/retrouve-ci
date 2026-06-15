import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SessionUser {
	name: string
	email: string
	phoneNumber: string | null
	phoneNumberVerified: boolean | null
	createdAt: string
}

export interface UserProfile {
	name: string
	email: string
	phone: string | null
	phoneVerified: boolean
	memberSince: string
}

export function toUserProfile(user: SessionUser): UserProfile {
	const memberSince = format(new Date(user.createdAt), 'MMMM yyyy', {
		locale: fr,
	})

	return {
		name: user.name,
		email: user.email,
		phone: user.phoneNumber,
		phoneVerified: Boolean(user.phoneNumberVerified),
		memberSince: memberSince.charAt(0).toUpperCase() + memberSince.slice(1),
	}
}
