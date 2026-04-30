import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'
import { Button } from '@retrouve-ci/ui/components/ui/button'

export function StickersCta() {
	return (
		<section className="py-16 md:py-20">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary-green)/10">
						<Shield className="h-7 w-7 text-(--primary-green)" />
					</div>
					<h2 className="mb-4 text-3xl font-bold md:text-4xl">
						Prêt à protéger vos objets ?
					</h2>
					<p className="text-muted-foreground mx-auto mb-8 max-w-md">
						Créez un compte gratuitement et commencez à protéger vos objets de
						valeur dès aujourd&apos;hui.
					</p>
					<div className="flex flex-wrap justify-center gap-3">
						<Button
							asChild
							size="lg"
							className="h-12 bg-(--primary-green) px-8 text-white hover:bg-(--primary-green-dark)"
						>
							<Link href="/stickers/commander">
								Commander maintenant
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="h-12 px-6">
							<Link href="/auth">Créer un compte</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
