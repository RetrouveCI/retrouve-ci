import { Button } from '@retrouve-ci/ui/components'
import { Link } from 'react-router'
import { ArrowRight, QrCode } from 'lucide-react'
import { useAuth } from '@/shared/auth/auth-context'

export function CtaSection() {
	const { isAuthenticated } = useAuth()

	return (
		<section className="py-20">
			<div className="container mx-auto px-4">
				<div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-neutral-900 p-10 md:p-14">
					<div className="from-primary-green/20 to-accent-orange/10 absolute inset-0 bg-linear-to-br via-transparent" />
					<div className="bg-primary-green/20 absolute -top-20 -right-20 h-60 w-60 rounded-full blur-3xl" />

					<div className="relative z-10 space-y-6 text-center">
						<span className="bg-primary-green/20 text-primary-green inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
							Gratuit, simple et solidaire
						</span>
						<h2 className="text-2xl font-bold text-white md:text-3xl">
							{isAuthenticated
								? 'Protégez vos objets dès aujourd’hui'
								: 'Créez votre compte et protégez vos objets'}
						</h2>
						<p className="mx-auto max-w-md text-white/70">
							Activez les alertes pour vos recherches et commandez des stickers
							QR pour qu&apos;on puisse vous joindre sans dévoiler vos
							coordonnées.
						</p>
						<div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
							<Button
								asChild
								size="lg"
								className="h-12 rounded-full bg-white px-6 text-neutral-900 hover:bg-white/90"
							>
								<Link
									to={isAuthenticated ? '/publish' : '/auth/register'}
									className="flex items-center gap-2"
								>
									{isAuthenticated
										? 'Publier une annonce'
										: 'Créer un compte gratuit'}
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								size="lg"
								className="h-12 rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
							>
								<Link to="/stickers" className="flex items-center gap-2">
									<QrCode className="h-4 w-4" />
									Découvrir les stickers QR
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
