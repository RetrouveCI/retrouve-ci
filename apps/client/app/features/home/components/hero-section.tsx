import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ShieldCheck, Users, MapPin } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'
import { SearchBar } from '@/shared/components/search-bar'

const CYCLING_WORDS = [
	'un objet',
	'un téléphone',
	'une clé',
	'un portefeuille',
	'un sac',
	'un bijou',
]

const TRUST_POINTS = [
	{ icon: ShieldCheck, label: 'Contact 100 % sécurisé' },
	{ icon: Users, label: "Une communauté d'entraide" },
	{ icon: MapPin, label: 'Partout en Côte d’Ivoire' },
]

function CyclingWord() {
	const [index, setIndex] = useState(0)
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		const interval = setInterval(() => {
			setIsVisible(false)
			setTimeout(() => {
				setIndex(i => (i + 1) % CYCLING_WORDS.length)
				setIsVisible(true)
			}, 300)
		}, 2500)
		return () => clearInterval(interval)
	}, [])

	return (
		<span
			className={cn(
				'inline-block transition-all duration-300 ease-out',
				isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
			)}
		>
			{CYCLING_WORDS[index]}
		</span>
	)
}

export function HeroSection() {
	return (
		<section className="relative flex min-h-[85vh] items-center overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem]" />
			<div className="bg-primary-green/15 absolute top-1/4 -right-20 h-125 w-125 rounded-full bg-linear-to-br to-transparent blur-3xl" />
			<div className="bg-accent-orange/10 absolute bottom-1/4 -left-20 h-100 w-100 rounded-full bg-linear-to-tl to-transparent blur-3xl" />

			<div className="relative z-10 container mx-auto px-4 py-20">
				<div className="mx-auto max-w-5xl">
					<h1 className="mb-6 text-center text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						<span className="block">
							Perdre{' '}
							<span className="relative inline-block min-w-45 text-left sm:min-w-60 md:min-w-75">
								<CyclingWord />
								<span className="bg-accent-orange/20 absolute right-0 -bottom-1 left-0 h-3 -skew-x-6 rounded" />
							</span>
						</span>
						<span className="mt-2 block">
							n&apos;est plus{' '}
							<span className="text-primary-green">une fatalité</span>
						</span>
					</h1>

					<p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-center text-lg md:text-xl">
						Signalez, recherchez et retrouvez vos objets perdus grâce à notre
						communauté active dans toute la Côte d&apos;Ivoire.
					</p>

					<div className="mx-auto mb-4 max-w-2xl">
						<SearchBar
							mode="navigate"
							action="/posts"
							size="lg"
							className="shadow-lg"
						/>
					</div>

					<p className="text-muted-foreground mb-16 text-center text-sm">
						Vous avez trouvé un objet ?{' '}
						<Link
							to="/publish"
							className="text-primary-green inline-flex items-center gap-1 font-medium hover:underline"
						>
							Signalez-le
							<ArrowRight className="h-3.5 w-3.5" />
						</Link>
					</p>

					<div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
						{TRUST_POINTS.map(({ icon: Icon, label }) => (
							<div
								key={label}
								className="text-muted-foreground flex items-center gap-2 text-sm font-medium"
							>
								<Icon className="text-primary-green h-5 w-5" />
								{label}
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
				<div className="border-muted-foreground/30 flex h-10 w-6 justify-center rounded-full border-2 pt-2">
					<div className="bg-muted-foreground/50 h-2 w-1 animate-bounce rounded-full" />
				</div>
			</div>
		</section>
	)
}
