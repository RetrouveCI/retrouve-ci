import { Link } from 'react-router'
import { Button } from '@retrouve-ci/ui/components'
import { SearchX, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
	return (
		<div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
			<div className="flex max-w-sm flex-col items-center gap-6">
				<div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full">
					<SearchX className="h-10 w-10" />
				</div>

				<div className="flex flex-col gap-2">
					<p className="text-primary text-sm font-semibold tracking-widest uppercase">
						Erreur 404
					</p>
					<h1 className="text-3xl font-bold tracking-tight">
						Page introuvable
					</h1>
					<p className="text-muted-foreground text-sm">
						Cette page n&apos;existe pas ou a été déplacée.
					</p>
				</div>

				<Button asChild>
					<Link to="/">
						<LayoutDashboard className="mr-2 h-4 w-4" />
						Retour au tableau de bord
					</Link>
				</Button>
			</div>
		</div>
	)
}
