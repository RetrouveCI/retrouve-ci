'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
	Sparkles,
	MapPin,
	Clock,
	ArrowRight,
	Package,
	Smartphone,
	Key,
	Wallet,
	Briefcase,
	Laptop,
	AlertCircle,
	CheckCircle,
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'

// Mirror of the mock data from annonces page — in a real app this would be an API call
const today = new Date()
const daysAgo = (n: number) => {
	const d = new Date(today)
	d.setDate(d.getDate() - n)
	return d.toISOString().split('T')[0]
}

export const ALL_LISTINGS = [
	{
		id: '1',
		title: 'iPhone 14 Pro noir',
		description:
			'Téléphone perdu dans un taxi à Cocody. Écran fissuré au coin.',
		location: 'Cocody, Abidjan',
		date: 'Il y a 2 jours',
		dateISO: daysAgo(2),
		type: 'lost' as const,
		category: 'phones',
		ville: 'Abidjan',
		commune: 'Cocody',
	},
	{
		id: '2',
		title: 'Trousseau de clés rouge',
		description: 'Clés trouvées près de la pharmacie du marché de Treichville.',
		location: 'Treichville, Abidjan',
		date: 'Il y a 1 jour',
		dateISO: daysAgo(1),
		type: 'found' as const,
		category: 'keys',
		ville: 'Abidjan',
		commune: 'Treichville',
	},
	{
		id: '3',
		title: 'Portefeuille en cuir marron',
		description: 'Portefeuille perdu contenant des documents importants.',
		location: 'Plateau, Abidjan',
		date: 'Il y a 3 jours',
		dateISO: daysAgo(3),
		type: 'lost' as const,
		category: 'wallets',
		ville: 'Abidjan',
		commune: 'Plateau',
	},
	{
		id: '4',
		title: 'Sac à dos noir Eastpak',
		description: 'Sac trouvé au terminal de bus de Yopougon.',
		location: 'Yopougon, Abidjan',
		date: "Aujourd'hui",
		dateISO: daysAgo(0),
		type: 'found' as const,
		category: 'bags',
		ville: 'Abidjan',
		commune: 'Yopougon',
	},
	{
		id: '5',
		title: 'MacBook Air M1 gris',
		description: 'Ordinateur portable oublié dans un café à Marcory.',
		location: 'Marcory, Abidjan',
		date: 'Hier',
		dateISO: daysAgo(1),
		type: 'lost' as const,
		category: 'electronics',
		ville: 'Abidjan',
		commune: 'Marcory',
	},
	{
		id: '6',
		title: "Carte d'identité nationale",
		description: 'Document trouvé près de la mairie.',
		location: 'Adjamé, Abidjan',
		date: 'Il y a 4 jours',
		dateISO: daysAgo(4),
		type: 'found' as const,
		category: 'other',
		ville: 'Abidjan',
		commune: 'Adjamé',
	},
	{
		id: '7',
		title: 'Samsung Galaxy S23 bleu',
		description: 'Téléphone retrouvé dans le bus SOTRA ligne 14.',
		location: 'Abobo, Abidjan',
		date: "Aujourd'hui",
		dateISO: daysAgo(0),
		type: 'found' as const,
		category: 'phones',
		ville: 'Abidjan',
		commune: 'Abobo',
	},
	{
		id: '8',
		title: 'Sac à main rouge en cuir',
		description: 'Sac perdu au centre commercial Cap Sud.',
		location: 'Koumassi, Abidjan',
		date: 'Il y a 2 jours',
		dateISO: daysAgo(2),
		type: 'lost' as const,
		category: 'bags',
		ville: 'Abidjan',
		commune: 'Koumassi',
	},
	{
		id: '9',
		title: 'Clés de voiture Toyota',
		description: 'Trousseau retrouvé sur le parking du supermarché Carrefour.',
		location: 'Riviera, Abidjan',
		date: "Aujourd'hui",
		dateISO: daysAgo(0),
		type: 'found' as const,
		category: 'keys',
		ville: 'Abidjan',
		commune: 'Riviera',
	},
	{
		id: '10',
		title: 'Casque audio Sony blanc',
		description: "Casque oublié dans une salle d'attente.",
		location: 'Plateau, Abidjan',
		date: 'Hier',
		dateISO: daysAgo(1),
		type: 'lost' as const,
		category: 'electronics',
		ville: 'Abidjan',
		commune: 'Plateau',
	},
	{
		id: '11',
		title: 'Portefeuille noir étudiant',
		description: "Perdu à l'université FHB. Badge étudiant visible.",
		location: 'Cocody, Abidjan',
		date: 'Il y a 1 jour',
		dateISO: daysAgo(1),
		type: 'lost' as const,
		category: 'wallets',
		ville: 'Abidjan',
		commune: 'Cocody',
	},
	{
		id: '12',
		title: 'Téléphone Samsung rouge',
		description: 'Retrouvé dans le bus SOTRA à Bouaké.',
		location: 'Bouaké',
		date: 'Il y a 3 jours',
		dateISO: daysAgo(3),
		type: 'found' as const,
		category: 'phones',
		ville: 'Bouaké',
		commune: '',
	},
]

// Map objectType (form value) → category (listing value)
const TYPE_TO_CATEGORY: Record<string, string> = {
	phone: 'phones',
	keys: 'keys',
	wallet: 'wallets',
	bag: 'bags',
	electronics: 'electronics',
	clothing: 'other',
	jewelry: 'other',
	documents: 'other',
	other: 'other',
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
	phones: Smartphone,
	keys: Key,
	wallets: Wallet,
	bags: Briefcase,
	electronics: Laptop,
	other: Package,
}

interface MatchingSuggestionsProps {
	/** Type selected in the form ('phone', 'keys', etc.) */
	objectType: string
	ville: string
	commune: string
	/** Which side we're on: 'perdu' shows found listings, 'retrouve' shows lost listings */
	formType: 'perdu' | 'retrouve'
}

export function MatchingSuggestions({
	objectType,
	ville,
	commune,
	formType,
}: MatchingSuggestionsProps) {
	const targetType = formType === 'perdu' ? 'found' : 'lost'
	const category = TYPE_TO_CATEGORY[objectType]

	const matches = ALL_LISTINGS.filter(l => {
		if (l.type !== targetType) return false
		if (l.category !== category) return false
		if (ville && l.ville.toLowerCase() !== ville.toLowerCase()) return false
		return true
	}).slice(0, 4)

	const accentColor =
		formType === 'perdu' ? 'var(--accent-orange)' : 'var(--primary-green)'
	const TypeIcon = formType === 'perdu' ? CheckCircle : AlertCircle

	return (
		<div className="bg-background overflow-hidden rounded-2xl border">
			{/* Header */}
			<div
				className="flex items-center gap-2.5 border-b px-4 py-3.5"
				style={{
					borderColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
					background: `color-mix(in srgb, ${accentColor} 5%, transparent)`,
				}}
			>
				<Sparkles className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
				<div className="min-w-0 flex-1">
					<p className="text-sm leading-tight font-semibold">
						{formType === 'perdu'
							? 'Objets similaires retrouvés'
							: 'Objets similaires perdus'}
					</p>
					<p className="text-muted-foreground mt-0.5 text-[11px]">
						{matches.length > 0
							? `${matches.length} correspondance${matches.length > 1 ? 's' : ''} trouvée${matches.length > 1 ? 's' : ''}`
							: 'Aucune correspondance pour le moment'}
					</p>
				</div>
				<TypeIcon
					className="h-4 w-4 shrink-0 opacity-50"
					style={{ color: accentColor }}
				/>
			</div>

			{/* Results */}
			{matches.length === 0 ? (
				<div className="px-4 py-6 text-center">
					<div className="bg-muted mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl">
						<Package className="text-muted-foreground/40 h-5 w-5" />
					</div>
					<p className="text-muted-foreground text-sm">
						Aucun objet correspondant trouvé{ville ? ` à ${ville}` : ''}.
					</p>
					<p className="text-muted-foreground/70 mt-1 text-xs">
						Votre annonce sera la première !
					</p>
				</div>
			) : (
				<ul className="divide-y">
					{matches.map(item => {
						const Icon = CATEGORY_ICONS[item.category] ?? Package
						return (
							<li key={item.id}>
								<Link
									href={`/annonces/${item.id}`}
									target="_blank"
									className="hover:bg-muted/40 group flex items-center gap-3 px-4 py-3 transition-colors"
								>
									{/* Icon */}
									<div
										className={cn(
											'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
											item.type === 'found' ? 'bg-green-50' : 'bg-red-50',
										)}
									>
										<Icon
											className={cn(
												'h-4 w-4',
												item.type === 'found'
													? 'text-[var(--primary-green)]'
													: 'text-red-500',
											)}
										/>
									</div>

									{/* Text */}
									<div className="min-w-0 flex-1">
										<p className="line-clamp-1 text-sm leading-tight font-medium transition-colors group-hover:text-[var(--primary-green)]">
											{item.title}
										</p>
										<div className="mt-0.5 flex items-center gap-2">
											<span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
												<MapPin className="h-3 w-3 shrink-0" />
												<span className="max-w-[90px] truncate">
													{item.location}
												</span>
											</span>
											<span className="text-muted-foreground flex items-center gap-0.5 text-[11px]">
												<Clock className="h-3 w-3 shrink-0" />
												{item.date}
											</span>
										</div>
									</div>

									<ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
								</Link>
							</li>
						)
					})}
				</ul>
			)}

			{/* Footer CTA */}
			<div className="bg-muted/20 border-t px-4 py-3">
				<Link
					href="/annonces"
					className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
				>
					Voir toutes les annonces
					<ArrowRight className="h-3 w-3" />
				</Link>
			</div>
		</div>
	)
}
