import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

export function AboutCta() {
	return (
		<section className="border-t py-12">
			<div className="container mx-auto px-4">
				<div className="bg-primary-green flex flex-col items-center justify-between gap-6 rounded-2xl p-8 text-white md:flex-row md:p-12">
					<div>
						<h2 className="mb-2 text-2xl font-bold md:text-3xl">
							Rejoignez la communauté
						</h2>
						<p className="text-white/80">
							Publiez votre première annonce gratuitement dès aujourd&apos;hui.
						</p>
					</div>
					<Link
						to="/publish"
						className="text-primary-green inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/90"
					>
						Publier une annonce
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</section>
	)
}
