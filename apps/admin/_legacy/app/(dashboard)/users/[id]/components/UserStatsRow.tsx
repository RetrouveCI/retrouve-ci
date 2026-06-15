import { BentoCard } from '@/components/bento-card'
import { QrCode, FileText, Package, ShoppingBag } from 'lucide-react'

interface UserStatsRowProps {
	qrCount: number
	postsCount: number
	ordersCount: number
	totalStickers: number
}

export function UserStatsRow({
	qrCount,
	postsCount,
	ordersCount,
	totalStickers,
}: UserStatsRowProps) {
	return (
		<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
			<BentoCard
				title="QR Codes"
				value={qrCount}
				icon={QrCode}
				iconColor="text-blue-600"
				iconBgColor="bg-blue-100"
			/>
			<BentoCard
				title="Posts"
				value={postsCount}
				icon={FileText}
				iconColor="text-orange-600"
				iconBgColor="bg-orange-100"
			/>
			<BentoCard
				title="Commandes"
				value={ordersCount}
				icon={Package}
				iconColor="text-purple-600"
				iconBgColor="bg-purple-100"
			/>
			<BentoCard
				title="Stickers commandés"
				value={totalStickers}
				icon={ShoppingBag}
				iconColor="text-green-600"
				iconBgColor="bg-green-100"
			/>
		</div>
	)
}
