import { BentoCard } from '@/components/admin/bento-card'
import { Bell, Package, FileText, Users, QrCode } from 'lucide-react'

interface NotificationStatsRowProps {
	unread: number
	orders: number
	posts: number
	users: number
	qr: number
}

export function NotificationStatsRow({ unread, orders, posts, users, qr }: NotificationStatsRowProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			<BentoCard
				variant={unread > 0 ? 'highlight' : 'stat'}
				title="Non lues"
				value={unread}
				icon={Bell}
				iconColor="text-primary"
				iconBgColor="bg-primary/10"
			/>
			<BentoCard
				variant="stat"
				title="Commandes"
				value={orders}
				icon={Package}
				iconColor="text-orange-600"
				iconBgColor="bg-orange-100"
			/>
			<BentoCard
				variant="stat"
				title="Posts"
				value={posts}
				icon={FileText}
				iconColor="text-purple-600"
				iconBgColor="bg-purple-100"
			/>
			<BentoCard
				variant="stat"
				title="Utilisateurs"
				value={users}
				icon={Users}
				iconColor="text-blue-600"
				iconBgColor="bg-blue-100"
			/>
			<BentoCard
				variant="stat"
				title="QR Codes"
				value={qr}
				icon={QrCode}
				iconColor="text-primary"
				iconBgColor="bg-primary/10"
			/>
		</div>
	)
}
