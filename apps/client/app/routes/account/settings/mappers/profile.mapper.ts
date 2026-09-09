import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatPhoneForDisplay } from '../helpers/format-phone'

interface SessionUser {
	name: string
	email: string
	phoneNumber: string | null
	phoneNumberVerified: boolean | null
	city: string | null
	commune: string | null
	createdAt: string
}

export interface UserProfile {
	name: string
	email: string
	phone: string | null
	phoneVerified: boolean
	city: string | null
	commune: string | null
	zone: string | null
	memberSince: string
}

export function toUserProfile(user: SessionUser): UserProfile {
	const memberSince = format(new Date(user.createdAt), 'MMMM yyyy', {
		locale: fr,
	})

	const zone = user.commune
		? `${user.commune}, ${user.city}`
		: (user.city ?? null)

	return {
		name: user.name,
		email: user.email,
		phone: formatPhoneForDisplay(user.phoneNumber),
		phoneVerified: Boolean(user.phoneNumberVerified),
		city: user.city,
		commune: user.commune,
		zone,
		memberSince: memberSince.charAt(0).toUpperCase() + memberSince.slice(1),
	}
}
