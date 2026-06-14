export const DELIVERY_FEE = 1000
export const VALID_COUPONS = ['RETROUVECI', 'LIVRAISON0', 'WELCOME2025']

export const PACKS = [
	{
		id: 'pack-4',
		name: 'Starter',
		quantity: 4,
		price: 1500,
		description: 'Idéal pour protéger vos essentiels',
		popular: false,
		features: ['4 stickers QR uniques', 'Support WhatsApp'],
	},
	{
		id: 'pack-8',
		name: 'Famille',
		quantity: 8,
		price: 2500,
		description: 'Protégez toute la famille',
		popular: true,
		features: [
			'8 stickers QR uniques',
			'Support prioritaire',
			'Économisez 500 FCFA',
		],
	},
	{
		id: 'pack-20',
		name: 'Pro',
		quantity: 20,
		price: 7000,
		description: 'Pour les entreprises et familles nombreuses',
		popular: false,
		features: [
			'20 stickers QR uniques',
			'Support dédié',
			'Économisez 3000 FCFA',
		],
	},
]

export const PAYMENT_METHODS = [
	{
		id: 'orange-money',
		name: 'Orange Money',
		icon: '/payments/orange-money.png',
		color: '#FF6600',
		prefix: '07',
	},
	{
		id: 'mtn-momo',
		name: 'MTN MoMo',
		icon: '/payments/mtn-momo.png',
		color: '#FFCC00',
		prefix: '05',
	},
	{
		id: 'moov-money',
		name: 'Moov Money',
		icon: '/payments/moov-money.png',
		color: '#0066CC',
		prefix: '01',
	},
	{
		id: 'wave',
		name: 'Wave',
		icon: '/payments/wave.png',
		color: '#1DC9FF',
		prefix: '07',
	},
]
