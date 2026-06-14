import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { ArrowRight, Shield } from 'lucide-react'
export function StickersCta() {
	return (
		<section className="py-16 md:py-20">
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-3xl text-center">
					<div className="bg-primary-green/10 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
						<Shield className="text-primary-green h-7 w-7" />
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
							className="bg-primary-green hover:bg-primary-green-dark h-12 px-8 text-white"
						>
							<Link to="/stickers/order">
								Commander maintenant
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="h-12 px-6">
							<Link to="/auth/register">Créer un compte</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
