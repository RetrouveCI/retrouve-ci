import { MapPin, Clock, ShieldAlert } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { categoryLabel } from '../../posts.const'

interface LostItem {
	title: string
	description: string
	location: string
	date: string
	type: 'lost' | 'found'
	category: string
	contact: { name: string }
}

/** §2.1's state pastille: 22 px, 10 px capitals, `letter-spacing` 0.04em. */
function Pill({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<span
			className={cn(
				'inline-flex h-[22px] items-center rounded-full px-2.5 text-xs font-bold tracking-[0.04em] uppercase',
				className,
			)}
		>
			{children}
		</span>
	)
}

function MetaCard({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType
	label: string
	value: string
}) {
	return (
		<div className="bg-muted/40 flex flex-1 items-center gap-2.5 rounded-xl border p-3">
			<Icon className="text-primary-green-text h-4.5 w-4.5 shrink-0" />
			<div className="min-w-0">
				<p className="text-muted-foreground text-xs tracking-wider uppercase">
					{label}
				</p>
				<p className="truncate text-sm font-semibold">{value}</p>
			</div>
		</div>
	)
}

export function PostContent({ listing }: { listing: LostItem }) {
	const isLost = listing.type === 'lost'

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				{/* Both grounds are fixed light surfaces, so both inks are fixed too. */}
				<Pill
					className={
						isLost ? 'bg-red-50 text-red-700' : 'text-primary-green bg-green-50'
					}
				>
					{isLost ? 'Perdu' : 'Retrouvé'}
				</Pill>
				<Pill className="bg-muted text-muted-foreground">
					{categoryLabel(listing.category)}
				</Pill>
			</div>

			<h1 className="text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
				{listing.title}
			</h1>

			<div className="flex gap-2.5">
				<MetaCard icon={MapPin} label="Lieu" value={listing.location} />
				<MetaCard icon={Clock} label="Date" value={listing.date} />
			</div>

			<div>
				<h2 className="mb-1.5 text-sm font-semibold">Description</h2>
				<p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
					{listing.description}
				</p>
			</div>

			<div className="flex items-center gap-3 rounded-xl border p-3.5">
				<span
					className="bg-primary-green/10 text-primary-green-text flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold"
					aria-hidden
				>
					{listing.contact.name.trim().charAt(0).toUpperCase()}
				</span>
				<p className="min-w-0 text-sm font-semibold">
					Publié par <span className="break-words">{listing.contact.name}</span>
				</p>
			</div>

			{/*
			 * §5 keeps this in the flow rather than in the action bar: it is an
			 * explanation, not an action, and it must be readable at the moment the
			 * description has just described an object worth meeting a stranger for.
			 */}
			<div className="border-accent-orange/20 bg-accent-orange/10 flex items-start gap-2.5 rounded-xl border p-3.5">
				<ShieldAlert className="text-accent-orange-text mt-px h-4 w-4 shrink-0" />
				<p className="text-accent-orange-text text-sm leading-relaxed">
					Ne versez jamais d&apos;argent avant d&apos;avoir vu l&apos;objet.
					Donnez rendez-vous dans un lieu public.
				</p>
			</div>

			{/*
			 * « Signaler » is parked, not dropped: the button was a `variant="ghost"`
			 * with no handler and the API has no reporting endpoint, so it promised a
			 * moderation path that did not exist. It comes back the day one does.
			 *
			 * <Button
			 * 	variant="ghost"
			 * 	size="sm"
			 * 	className="text-muted-foreground hover:text-destructive gap-2"
			 * >
			 * 	<Flag className="h-4 w-4" />
			 * 	Signaler
			 * </Button>
			 */}
		</div>
	)
}
