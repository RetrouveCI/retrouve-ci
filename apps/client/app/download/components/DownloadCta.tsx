import Link from 'next/link'
import { Clock, ArrowRight } from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components'

export function DownloadCta() {
	return (
		<section className="py-16 md:py-24">
			<div className="container mx-auto px-4">
				<div className="bg-background relative mx-auto max-w-2xl overflow-hidden rounded-2xl border p-10 text-center">
					<div className="bg-primary-green/5 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-2xl" />
					<div className="border-accent-orange/20 bg-accent-orange/10 text-accent-orange mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
						<Clock className="h-3.5 w-3.5" />
						En attendant l&apos;application mobile
					</div>
					<h2 className="mb-3 text-2xl font-bold md:text-3xl">
						Utilisez la version web
					</h2>
					<p className="text-muted-foreground mx-auto mb-8 max-w-sm">
						Consultez les annonces, publiez vos objets et commandez vos stickers
						QR dès maintenant.
					</p>
					<div className="flex flex-col justify-center gap-3 sm:flex-row">
						<Button
							asChild
							size="lg"
							className="bg-primary-green hover:bg-primary-green-dark h-11 rounded-xl px-6 text-white"
						>
							<Link href="/posts" className="gap-2">
								Voir les annonces
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="h-11 rounded-xl px-6"
						>
							<Link href="/stickers">Commander des stickers</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
