import { Button } from '@retrouve-ci/ui/components'
import { ArrowLeft, Home, SearchX } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundContent() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
			<div className="flex max-w-md flex-col items-center gap-6">
				<div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
					<SearchX className="h-10 w-10" />
				</div>

				<div className="flex flex-col gap-2">
					<p className="text-primary text-sm font-semibold tracking-widest uppercase">
						Erreur 404
					</p>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Page introuvable
					</h1>
					<p className="text-muted-foreground">
						Oops ! Cette page n&apos;existe pas ou a été déplacée. Vérifiez
						l&apos;adresse ou retournez à l&apos;accueil.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button asChild>
						<Link to="/">
							<Home className="mr-2 h-4 w-4" />
							Retour à l&apos;accueil
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link to="/posts">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voir les annonces
						</Link>
					</Button>
				</div>
			</div>
		</main>
	)
}
