import { FileText, Eye, MessageCircle, Shield } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import type { Sticker } from '@/shared/types/sticker'
import type { UserLostItem } from '@/shared/types/lost-item'

interface AccountStatsProps {
	stickers: Sticker[]
	listings: UserLostItem[]
}

export function AccountStats({ stickers, listings }: AccountStatsProps) {
	const activeStickers = stickers.filter(s => s.isActive).length
	const activeListings = listings.filter(
		l => l.moderationStatus === 'published' && l.status === 'active',
	).length
	const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
	const totalContacts = listings.reduce((sum, l) => sum + l.contacts, 0)

	const statItems = [
		{
			icon: FileText,
			value: activeListings,
			label: 'Annonces actives',
			accent: 'green',
		},
		{ icon: Eye, value: totalViews, label: 'Vues totales', accent: 'orange' },
		{
			icon: MessageCircle,
			value: totalContacts,
			label: 'Contacts reçus',
			accent: 'green',
		},
		{
			icon: Shield,
			value: activeStickers,
			label: 'Stickers actifs',
			accent: 'orange',
		},
	] as const

	return (
		<section className="py-8">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{statItems.map(({ icon: Icon, value, label, accent }) => {
						const isGreen = accent === 'green'
						return (
							<div
								key={label}
								className={cn(
									'bg-background border-border/50 group rounded-2xl border p-4 transition-all hover:shadow-sm',
									isGreen
										? 'hover:border-primary-green/40'
										: 'hover:border-accent-orange/40',
								)}
							>
								<div
									className={cn(
										'mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
										isGreen ? 'bg-primary-green/10' : 'bg-accent-orange/10',
									)}
								>
									<Icon
										className={cn(
											'h-5 w-5',
											isGreen ? 'text-primary-green' : 'text-accent-orange',
										)}
									/>
								</div>
								<p className="text-2xl font-bold md:text-3xl">{value}</p>
								<p className="text-muted-foreground text-xs">{label}</p>
							</div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
