import {
	DELIVERY_FEE,
	FREE_DELIVERY_COUPONS,
} from '@app/contracts/sticker-orders'

export function computeDeliveryFee(couponCode?: string): number {
	if (couponCode && FREE_DELIVERY_COUPONS.includes(couponCode.toUpperCase())) {
		return 0
	}

	return DELIVERY_FEE
}
