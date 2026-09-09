import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { pageMeta } from '@/shared/helpers/page-meta'
import { InstallHero } from './components/install-hero'
import { InstallBenefits } from './components/install-benefits'
import { InstallSteps } from './components/install-steps'

export function meta() {
	return pageMeta({
		title: "Installer l'application",
		description:
			"Ajoutez RetrouveCI à votre écran d'accueil : ouverture immédiate, annonces déjà consultées lisibles sans réseau, raccourci vers le scanner.",
	})
}

export default function Download() {
	// An app already on the home screen has no install left to explain.
	const installed = useMediaQuery('(display-mode: standalone)')

	return (
		<main className="mx-auto w-full max-w-2xl flex-1">
			<InstallHero installed={installed} />
			<InstallBenefits />
			{!installed && <InstallSteps />}
		</main>
	)
}
