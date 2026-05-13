import { QrCode, Shield, FileText, Eye } from 'lucide-react'
import type { Sticker } from '@/domain/entities/sticker'
import type { UserListing } from '@/domain/entities/listing'

interface AccountStatsProps {
	stickers: Sticker[]
	listings: UserListing[]
}

export function AccountStats({ stickers, listings }: AccountStatsProps) {
	const activeStickers = stickers.filter(s => s.isActive).length
	const activeListings = listings.filter(l => l.status === 'active').length
	const totalViews = listings.reduce((sum, l) => sum + l.views, 0)

	const statItems = [
		{
			icon: QrCode,
			value: stickers.length,
			label: 'Stickers total',
			color: 'primary-green',
			hoverBorder: 'hover:border-primary-green/40',
		},
		{
			icon: Shield,
			value: activeStickers,
			label: 'Stickers actifs',
			color: 'primary-green',
			hoverBorder: 'hover:border-primary-green/40',
		},
		{
			icon: FileText,
			value: activeListings,
			label: 'Annonces actives',
			color: 'accent-orange',
			hoverBorder: 'hover:border-accent-orange/40',
		},
		{
			icon: Eye,
			value: totalViews,
			label: 'Vues totales',
			color: 'blue-500',
			hoverBorder: 'hover:border-blue-400/40',
		},
	]

	return (
		<section className="py-6">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{statItems.map(({ icon: Icon, value, label, hoverBorder }) => (
						<div
							key={label}
							className={`bg-background border-border/50 group rounded-2xl border p-4 transition-all hover:shadow-sm ${hoverBorder}`}
						>
							<div className="mb-2 flex items-center justify-between">
								<div className="bg-primary-green/10 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
									<Icon className="text-primary-green h-5 w-5" />
								</div>
							</div>
							<p className="text-2xl font-bold md:text-3xl">{value}</p>
							<p className="text-muted-foreground text-xs">{label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
