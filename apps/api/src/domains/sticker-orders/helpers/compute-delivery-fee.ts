import { DELIVERY_FEE, FREE_DELIVERY_COUPONS } from '../constants'

export function computeDeliveryFee(couponCode?: string): number {
	if (couponCode && FREE_DELIVERY_COUPONS.includes(couponCode.toUpperCase())) {
		return 0
	}

	return DELIVERY_FEE
}
