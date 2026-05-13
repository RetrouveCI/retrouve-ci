import Link from 'next/link'
import {
	QrCode,
	FileText,
	Package,
	Settings,
	ChevronRight,
	ArrowRight,
	Plus,
} from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import type { Sticker } from '@/domain/entities/sticker'
import type { UserListing } from '@/domain/entities/listing'

interface AccountNavProps {
	stickers: Sticker[]
	listings: UserListing[]
}

export function AccountNav({ stickers, listings }: AccountNavProps) {
	const activeStickers = stickers.filter(s => s.isActive).length
	const activeListings = listings.filter(l => l.status === 'active').length

	const featuredItems = [
		{
			href: '/compte/stickers',
			icon: QrCode,
			label: 'Mes Stickers QR',
			description: 'Gérez vos stickers et protégez vos objets',
			stat: `${activeStickers} actif${activeStickers > 1 ? 's' : ''}`,
			color: 'primary-green',
		},
		{
			href: '/compte/annonces',
			icon: FileText,
			label: 'Mes Annonces',
			description: 'Objets perdus et retrouvés',
			stat: `${activeListings} active${activeListings > 1 ? 's' : ''}`,
			color: 'accent-orange',
		},
		{
			href: '/compte/commandes',
			icon: Package,
			label: 'Mes Commandes',
			description: 'Historique et suivi de vos commandes',
			stat: '3 commandes',
			color: 'primary-green',
		},
	]

	return (
		<section className="pb-12">
			<div className="container mx-auto px-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{featuredItems.map(item => {
						const Icon = item.icon
						const isGreen = item.color === 'primary-green'
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'group bg-background border-border/50 relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
									isGreen
										? 'hover:border-primary-green/40'
										: 'hover:border-accent-orange/40',
								)}
							>
								<div
									className={cn(
										'absolute top-0 right-6 left-6 h-1 rounded-b-full transition-all duration-300 group-hover:right-4 group-hover:left-4',
										isGreen ? 'bg-primary-green' : 'bg-accent-orange',
									)}
								/>
								<div className="mt-2 flex items-start justify-between gap-4">
									<div className="flex-1">
										<div
											className={cn(
												'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
												isGreen
													? 'bg-primary-green/10'
													: 'bg-accent-orange/10',
											)}
										>
											<Icon
												className={cn(
													'h-6 w-6',
													isGreen
														? 'text-primary-green'
														: 'text-accent-orange',
												)}
											/>
										</div>
										<h3 className="mb-1 text-xl font-bold">{item.label}</h3>
										<p className="text-muted-foreground mb-3 text-sm">
											{item.description}
										</p>
										<span
											className={cn(
												'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
												isGreen
													? 'bg-primary-green/10 text-primary-green'
													: 'bg-accent-orange/10 text-accent-orange',
											)}
										>
											<span className="h-1.5 w-1.5 rounded-full bg-current" />
											{item.stat}
										</span>
									</div>
									<ArrowRight className="text-muted-foreground group-hover:text-foreground mt-2 h-5 w-5 transition-all group-hover:translate-x-1" />
								</div>
							</Link>
						)
					})}
				</div>

				<Link
					href="/compte/parametres"
					className="group bg-background border-border/50 hover:border-border mt-4 flex items-center justify-between gap-4 rounded-2xl border p-5 transition-all hover:shadow-md"
				>
					<div className="flex items-center gap-4">
						<div className="bg-muted flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
							<Settings className="text-muted-foreground h-5 w-5" />
						</div>
						<div>
							<h3 className="font-semibold">Paramètres</h3>
							<p className="text-muted-foreground text-sm">
								Informations et notifications
							</p>
						</div>
					</div>
					<ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
				</Link>

				<div className="mt-8 grid gap-3 sm:grid-cols-2">
					<Link
						href="/publier"
						className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-accent-orange/30 bg-accent-orange/5 p-4 transition-all hover:border-accent-orange/50 hover:bg-accent-orange/10"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange transition-transform group-hover:scale-110">
							<Plus className="h-5 w-5 text-white" />
						</div>
						<div>
							<p className="text-sm font-semibold">Nouvelle annonce</p>
							<p className="text-muted-foreground text-xs">
								Objet perdu ou retrouvé
							</p>
						</div>
					</Link>
					<Link
						href="/stickers"
						className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-primary-green/30 bg-primary-green/5 p-4 transition-all hover:border-primary-green/50 hover:bg-primary-green/10"
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-green transition-transform group-hover:scale-110">
							<QrCode className="h-5 w-5 text-white" />
						</div>
						<div>
							<p className="text-sm font-semibold">Commander des stickers</p>
							<p className="text-muted-foreground text-xs">
								Protégez vos objets
							</p>
						</div>
					</Link>
				</div>
			</div>
		</section>
	)
}
