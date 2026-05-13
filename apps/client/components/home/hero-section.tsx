'use client'

import { Button } from '@retrouve-ci/ui/components'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@retrouve-ci/ui/utils'

const CYCLING_WORDS = [
	'un objet',
	'un téléphone',
	'une clé',
	'un portefeuille',
	'un sac',
	'un bijou',
]

const HERO_STATS = [
	{ value: 2847, label: 'Objets retrouvés', suffix: '+' },
	{ value: 12500, label: 'Utilisateurs', suffix: '+' },
	{ value: 95, label: 'Taux de succès', suffix: '%' },
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

function AnimatedCounter({
	target,
	suffix = '',
}: {
	target: number
	suffix?: string
}) {
	const [count, setCount] = useState(0)

	useEffect(() => {
		const duration = 2000
		const steps = 60
		const increment = target / steps
		let current = 0

		const timer = setInterval(() => {
			current += increment
			if (current >= target) {
				setCount(target)
				clearInterval(timer)
			} else {
				setCount(Math.floor(current))
			}
		}, duration / steps)

		return () => clearInterval(timer)
	}, [target])

	return (
		<span className="tabular-nums">
			{count.toLocaleString('fr-FR')}
			{suffix}
		</span>
	)
}

export function HeroSection() {
	return (
		<section className="relative flex min-h-[85vh] items-center overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
			<div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-primary-green/15 bg-linear-to-br to-transparent blur-3xl" />
			<div className="absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent-orange/10 bg-linear-to-tl to-transparent blur-3xl" />

			<div className="relative z-10 container mx-auto px-4 py-20">
				<div className="mx-auto max-w-5xl">
					<div className="mb-8 flex justify-center">
						<div className="bg-foreground/5 border-border/50 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
							<span className="flex h-2 w-2 animate-pulse rounded-full bg-primary-green" />
							<span className="text-muted-foreground">
								La plateforme #1 en Côte d&apos;Ivoire
							</span>
						</div>
					</div>

					<h1 className="mb-6 text-center text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
						<span className="block">
							Perdre{' '}
							<span className="relative inline-block min-w-[180px] text-left sm:min-w-[240px] md:min-w-[300px]">
								<CyclingWord />
								<span className="absolute right-0 -bottom-1 left-0 h-3 -skew-x-6 rounded bg-accent-orange/20" />
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

					<div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Button
							asChild
							size="lg"
							className="bg-foreground text-background hover:bg-foreground/90 h-14 rounded-full px-8 text-base transition-all duration-300 hover:scale-105 hover:shadow-xl"
						>
							<Link href="/publish" className="flex items-center gap-2">
								Signaler un objet
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="h-14 rounded-full border-2 px-8 text-base transition-all duration-300 hover:scale-105"
						>
							<Link href="/posts">Parcourir les annonces</Link>
						</Button>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
						{HERO_STATS.map(stat => (
							<div key={stat.label} className="text-center">
								<div className="text-2xl font-bold md:text-3xl">
									<AnimatedCounter target={stat.value} suffix={stat.suffix} />
								</div>
								<div className="text-muted-foreground text-sm">
									{stat.label}
								</div>
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
