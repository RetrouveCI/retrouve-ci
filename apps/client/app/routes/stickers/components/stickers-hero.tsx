import { Button } from '@app/ui/components'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { StickerMark } from './sticker-mark'
import { CurvedArrow, TAGGED_OBJECTS } from './tagged-objects'

const { Phone, Bottle, Wallet } = TAGGED_OBJECTS

export function StickersHero() {
	const { isAuthenticated } = useAuth()

	return (
		<section className="relative overflow-hidden border-b">
			{/* The same three layers the home and listings pages use: a white
			    ground, a fine grid, then green and orange nebulae. The palette is
			    the site's, not this page's. */}
			<div
				className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-size-[4rem_4rem]"
				aria-hidden
			/>
			<div
				className="bg-primary-green/15 pointer-events-none absolute top-1/4 -right-20 h-125 w-125 rounded-full bg-linear-to-br to-transparent blur-3xl"
				aria-hidden
			/>
			<div
				className="bg-accent-orange/10 pointer-events-none absolute bottom-1/4 -left-20 h-100 w-100 rounded-full bg-linear-to-tl to-transparent blur-3xl"
				aria-hidden
			/>

			{/* Left: the product on its own, at two sizes, as the reference does. */}
			<div className="pointer-events-none absolute top-10 -left-10 hidden w-72 md:block lg:left-4 xl:left-16">
				<StickerMark tone="green" tilt={-9} className="w-32 lg:w-40" />
				{/* Each sticker carries a code, and activating it is a real step of
				    the journey. Saying so here costs a line. */}
				<p className="text-muted-foreground mt-3 ml-2 text-xs">
					Chaque sticker porte son code
					<span className="text-foreground block font-semibold tracking-[0.14em] tabular-nums">
						RCI-4A7F-2K91
					</span>
				</p>
				<div className="mt-8 ml-16 flex items-end gap-4">
					<StickerMark tone="light" tilt={7} className="w-20 lg:w-24" />
					<CurvedArrow className="text-foreground/25 mb-2 w-20" />
				</div>
			</div>

			{/* Right: the objects wearing it. */}
			<div
				className="pointer-events-none absolute -right-10 -bottom-4 hidden items-end gap-5 md:flex lg:right-0 xl:right-10"
				aria-hidden
			>
				<div className="relative w-36 lg:w-44">
					<Wallet />
					<StickerMark
						tone="green"
						tilt={-6}
						className="absolute top-4 left-4 w-12"
					/>
				</div>
				<div className="relative w-28 translate-y-6 lg:w-36">
					<Phone />
					<StickerMark
						tone="light"
						tilt={4}
						className="absolute bottom-8 left-1/2 w-14 -translate-x-1/2"
					/>
				</div>
				<div className="relative w-20 translate-y-10 lg:w-24">
					<Bottle />
					<StickerMark
						tone="orange"
						tilt={-5}
						className="absolute top-20 left-1/2 w-12 -translate-x-1/2"
					/>
				</div>
			</div>

			<div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-28">
				<div className="mx-auto max-w-xl text-center">
					<h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-[56px] lg:leading-[1.05]">
						Le sticker qui ramène vos objets
					</h1>
					<p className="text-muted-foreground mx-auto mt-5 max-w-md text-base text-pretty md:text-lg">
						Collez-le sur ce qui compte. Celui qui trouve scanne et vous êtes
						prévenu.
					</p>

					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<Button
							asChild
							className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 text-base font-semibold"
						>
							<Link to="/stickers/order">
								Je commande
								<ArrowRight className="ml-1 h-4 w-4" />
							</Link>
						</Button>
						{/* The funnel's other door: ordering needs an account, and this
						    hero dropped the only link to one. */}
						{!isAuthenticated && (
							<Button
								asChild
								variant="outline"
								className="rounded-full px-8 text-base font-semibold"
							>
								<Link to="/register">Créer un compte</Link>
							</Button>
						)}
					</div>

					<p className="text-muted-foreground mt-5 text-sm">
						À partir de{' '}
						<span className="text-foreground font-semibold">2 000 FCFA</span> ·
						payés à la livraison
					</p>
				</div>

				{/* Below `md` the scene has no room, so the product stands alone. */}
				<div className="mt-12 flex items-end justify-center gap-4 md:hidden">
					<StickerMark tone="light" tilt={-8} className="w-20" />
					<StickerMark tone="green" tilt={5} className="w-28" />
					<div className="relative w-20">
						<Phone />
						<StickerMark
							tone="orange"
							tilt={6}
							className="absolute bottom-6 left-1/2 w-11 -translate-x-1/2"
						/>
					</div>
				</div>
				<p className="text-muted-foreground mt-5 text-center text-xs md:hidden">
					Chaque sticker porte son code
					<span className="text-foreground block font-semibold tracking-[0.14em] tabular-nums">
						RCI-4A7F-2K91
					</span>
				</p>
			</div>
		</section>
	)
}
