import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
	return (
		<section className="py-20">
			<div className="container mx-auto px-4">
				<div className="bg-foreground relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-10 md:p-14">
					<div className="from-primary-green/20 to-accent-orange/10 absolute inset-0 bg-linear-to-br via-transparent" />
					<div className="bg-primary-green/20 absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" />

					<div className="relative z-10 space-y-6 text-center">
						<h2 className="text-2xl font-bold text-white md:text-3xl">
							Prêt à retrouver ce qui vous appartient ?
						</h2>
						<p className="mx-auto max-w-md text-white/70">
							Rejoignez des milliers d&apos;Ivoiriens qui utilisent RetrouveCI.
						</p>
						<div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
							<Button
								asChild
								size="lg"
								className="text-foreground h-12 rounded-full bg-white px-6 hover:bg-white/90"
							>
								<Link to="/publish" className="flex items-center gap-2">
									Publier une annonce
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="h-12 rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
							>
								<Link to="/posts">Voir les annonces</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
