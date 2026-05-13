import { Button } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { ArrowRight, Sparkles, QrCode, Zap } from 'lucide-react'
export function StickersHero() {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-20 right-0 h-125 w-125 rounded-full bg-primary-green/5 blur-3xl" />
				<div className="absolute bottom-0 left-0 h-75 w-75 rounded-full bg-accent-orange/5 blur-3xl" />
			</div>

			<div className="relative container mx-auto px-4 py-16 md:py-24">
				<div className="mx-auto max-w-4xl">
					<div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
						<div className="flex-1 text-center md:text-left">
							<div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-green/10 px-3 py-1 text-xs font-medium text-primary-green">
								<Sparkles className="h-3.5 w-3.5" />
								Technologie QR intelligente
							</div>
							<h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl">
								Protégez vos objets avec un simple{' '}
								<span className="text-primary-green">QR code</span>
							</h1>
							<p className="text-muted-foreground mb-8 max-w-lg text-lg">
								Collez, scannez, récupérez. Nos stickers QR permettent à
								quiconque trouve votre objet de vous contacter en toute
								sécurité.
							</p>
							<div className="flex flex-wrap justify-center gap-3 md:justify-start">
								<Button
									asChild
									size="lg"
									className="h-12 bg-primary-green px-6 text-white hover:bg-primary-green-dark"
								>
									<Link href="/stickers/order">
										Commander mes stickers
										<ArrowRight className="ml-2 h-4 w-4" />
									</Link>
								</Button>
								<Button
									asChild
									size="lg"
									variant="outline"
									className="h-12 px-6"
								>
									<Link href="/auth">Créer un compte</Link>
								</Button>
							</div>
							<p className="text-muted-foreground mt-4 text-sm">
								À partir de{' '}
								<span className="text-foreground font-semibold">
									1 500 FCFA
								</span>{' '}
								· Livraison gratuite
							</p>
						</div>

						<div className="relative shrink-0">
							<div className="relative h-52 w-52 md:h-64 md:w-64">
								<div className="absolute inset-0 rotate-6 rounded-3xl bg-linear-to-br from-primary-green/20 to-accent-orange/10" />
								<div className="bg-background absolute inset-0 flex items-center justify-center rounded-2xl border shadow-xl">
									<div className="text-center">
										<QrCode className="mx-auto mb-3 h-20 w-20 text-primary-green md:h-28 md:w-28" />
										<p className="text-muted-foreground text-xs font-medium">
											RCI-XXXX-XXXX
										</p>
									</div>
								</div>
								<div className="absolute -right-3 -bottom-3 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-orange shadow-lg">
									<Zap className="h-7 w-7 text-white" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
