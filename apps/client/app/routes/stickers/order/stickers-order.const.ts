import {
	STICKER_PACKS,
	type StickerPackId,
} from '@app/contracts/sticker-orders'

export {
	DELIVERY_FEE,
	FREE_DELIVERY_COUPONS,
} from '@app/contracts/sticker-orders'

interface PackCopy {
	description: string
	popular: boolean
	features: string[]
}

// Sales copy only. The id, name, quantity and price come from the contract, so
// the price shown here cannot drift from the price the API charges.
const PACK_COPY: Record<StickerPackId, PackCopy> = {
	'pack-4': {
		description: 'Idéal pour protéger vos essentiels',
		popular: false,
		features: ['4 stickers QR uniques', 'Support WhatsApp'],
	},
	'pack-8': {
		description: 'Protégez toute la famille',
		popular: true,
		features: [
			'8 stickers QR uniques',
			'Support prioritaire',
			'Économisez 500 FCFA',
		],
	},
	'pack-20': {
		description: 'Pour les entreprises et familles nombreuses',
		popular: false,
		features: [
			'20 stickers QR uniques',
			'Support dédié',
			'Économisez 3000 FCFA',
		],
	},
}

export const PACKS = STICKER_PACKS.map(pack => ({
	...pack,
	...PACK_COPY[pack.id],
}))

// Mobile-money catalogue parked: stickers are paid to the courier, so the order
// collects no payment choice. Kept intact — with `components/payment-step.tsx`
// — for the day a gateway is wired in.
// export const PAYMENT_METHODS = [
// 	{
// 		id: 'orange-money',
// 		name: 'Orange Money',
// 		icon: '/payments/orange-money.png',
// 		color: '#FF6600',
// 		prefix: '07',
// 	},
// 	{
// 		id: 'mtn-momo',
// 		name: 'MTN MoMo',
// 		icon: '/payments/mtn-momo.png',
// 		color: '#FFCC00',
// 		prefix: '05',
// 	},
// 	{
// 		id: 'moov-money',
// 		name: 'Moov Money',
// 		icon: '/payments/moov-money.png',
// 		color: '#0066CC',
// 		prefix: '01',
// 	},
// 	{
// 		id: 'wave',
// 		name: 'Wave',
// 		icon: '/payments/wave.png',
// 		color: '#1DC9FF',
// 		prefix: '07',
// 	},
// ]
