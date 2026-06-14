export type { User } from '@/shared/types/user'
export type { Sticker } from '@/shared/types/sticker'
export type { UserListing, ListingStatus } from '@/shared/types/listing'

export type OrderStatus =
	| 'pending'
	| 'confirmed'
	| 'shipped'
	| 'delivered'
	| 'cancelled'

export interface Order {
	id: string
	orderNumber: string
	date: string
	pack: { name: string; quantity: number; price: number }
	deliveryFee: number
	total: number
	status: OrderStatus
	paymentMethod: string
	deliveryAddress: string
	estimatedDelivery?: string
	trackingNumber?: string
}
