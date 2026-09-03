import { Link } from 'react-router'
import { CircleAlert, Check } from 'lucide-react'
import type { LostItemCategory } from '@app/contracts/lost-items'
import { SearchBar } from '@/components/search-bar'
import { filterPillClassName } from '@/components/filter-pill'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { CATEGORY_FILTERS } from '../../posts/posts.const'
import { HeroMap } from './hero-map'

// A category dropped from the contract is a type error here; `flatMap` keeps the
// drawn order without asserting the lookup cannot miss.
const SHORTCUT_IDS: readonly LostItemCategory[] = [
	'phone',
	'keys',
	'documents',
	'bag',
]

const SHORTCUTS = SHORTCUT_IDS.flatMap(id => {
	const filter = CATEGORY_FILTERS.find(entry => entry.id === id)

	return filter ? [filter] : []
})

export function HeroSection({ publishedCount }: { publishedCount?: number }) {
	// The map's column exists from `md`; below it, the map is never mounted.
	const showMap = useMediaQuery('(min-width: 768px)')

	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem]" />
			<div className="bg-primary-green/15 absolute top-1/4 -right-20 h-125 w-125 rounded-full bg-linear-to-br to-transparent blur-3xl" />
			<div className="bg-accent-orange/10 absolute bottom-1/4 -left-20 h-100 w-100 rounded-full bg-linear-to-tl to-transparent blur-3xl" />

			<div className="relative z-10 container mx-auto px-4 py-8 md:py-12 lg:py-16">
				{/* Uncapped, every pixel past 620 fell between the two columns. */}
				<div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
					<div className="flex min-w-0 flex-col items-start gap-4 lg:max-w-155 lg:gap-5">
						{/* Real or absent — §3 forbids a reassurance figure written by hand. */}
						{publishedCount !== undefined && publishedCount > 0 && (
							<span className="bg-primary-green/12 text-primary-green-text flex h-7 items-center gap-2 rounded-full px-3 text-xs font-semibold">
								<span className="bg-primary-green h-1.5 w-1.5 rounded-full" />
								{publishedCount} annonces en ligne
							</span>
						)}

						<h1 className="text-3xl leading-[1.14] font-bold tracking-tight text-balance md:text-4xl lg:text-5xl xl:text-[3.375rem] xl:leading-[1.06]">
							Perdu quelque chose&nbsp;?
							<br />
							<span className="text-primary-green-text">
								La communauté cherche avec vous.
							</span>
						</h1>

						<p className="text-muted-foreground hidden max-w-125 text-xl lg:block">
							Signalez, cherchez et retrouvez vos objets partout en Côte
							d&apos;Ivoire — ou protégez-les à l&apos;avance avec un sticker
							QR.
						</p>

						{/* The form is a flex item, so the width has to sit above it. */}
						<div className="w-full lg:max-w-140">
							<SearchBar
								mode="navigate"
								action="/posts"
								size="lg"
								submit="responsive"
								className="shadow-lg"
							/>
						</div>

						{/* §2.3 rule 3's two words; white on the orange reads 2.70:1. */}
						<div className="flex w-full gap-2.5 lg:w-auto">
							<Link
								to="/publish/lost"
								className="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark h-control flex flex-1 items-center justify-center gap-2 rounded-[14px] px-5 text-lg font-semibold transition-colors lg:flex-initial lg:px-7"
							>
								<CircleAlert className="h-4.5 w-4.5" />
								J&apos;ai perdu
							</Link>
							<Link
								to="/publish/found"
								className="bg-primary-green hover:bg-primary-green-dark h-control flex flex-1 items-center justify-center gap-2 rounded-[14px] px-5 text-lg font-semibold text-white transition-colors lg:flex-initial lg:px-7"
							>
								<Check className="h-4.5 w-4.5" />
								J&apos;ai trouvé
							</Link>
						</div>

						{/* A secondary list, so it may scroll (§2.1); `gap-2` clears the
						    3 px each pill's tap zone overhangs. No negative margin: it
						    widens the flex column, which the grid item cannot shrink. */}
						<div className="scrollbar-hide flex w-full gap-2 overflow-x-auto pt-0.5 lg:flex-wrap">
							{SHORTCUTS.map(({ id, label, icon: Icon }) => (
								<Link
									key={id}
									to={`/posts?category=${id}`}
									className={filterPillClassName(false)}
								>
									<Icon className="h-4 w-4 shrink-0" />
									{label}
								</Link>
							))}
						</div>
					</div>

					{/* Height-driven and ratio-locked: past 2xl it letterboxes. */}
					<div className="hidden h-74 md:block lg:h-105 2xl:h-125">
						{showMap && <HeroMap />}
					</div>
				</div>
			</div>
		</section>
	)
}
