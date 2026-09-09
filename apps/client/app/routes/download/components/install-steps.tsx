import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { FilterPill } from '@/components/filter-pill'
import { useInstallPrompt } from '@/shared/hooks/use-install-prompt'
import { isApplePlatform } from '../helpers/platform'

type Platform = 'android' | 'ios'

const PLATFORMS: { id: Platform; label: string }[] = [
	{ id: 'android', label: 'Android' },
	{ id: 'ios', label: 'iPhone' },
]

const IOS_STEPS = [
	<>
		Touchez le bouton <b>Partager</b> dans la barre de Safari.
	</>,
	<>
		Faites défiler, puis choisissez <b>Sur l&apos;écran d&apos;accueil</b>.
	</>,
	<>
		Touchez <b>Ajouter</b> : l&apos;icône verte rejoint vos applications.
	</>,
]

function androidSteps(hasButton: boolean) {
	return [
		hasButton ? (
			<>
				Touchez <b>Installer maintenant</b> ci-dessus, ou le menu <b>⋮</b> du
				navigateur.
			</>
		) : (
			<>
				Ouvrez le menu <b>⋮</b> de votre navigateur.
			</>
		),
		<>
			Choisissez <b>Installer l&apos;application</b> ou{' '}
			<b>Ajouter à l&apos;écran d&apos;accueil</b>.
		</>,
		<>L&apos;icône verte apparaît avec vos autres applications.</>,
	]
}

export function InstallSteps() {
	const { installable } = useInstallPrompt()
	const [platform, setPlatform] = useState<Platform>('android')

	// Settled after hydration, not at the first paint: the server cannot read a
	// user agent it was not sent, and a mismatch here would swap the whole list.
	useEffect(() => {
		if (isApplePlatform(navigator.userAgent, navigator.maxTouchPoints))
			setPlatform('ios')
	}, [])

	const steps = platform === 'ios' ? IOS_STEPS : androidSteps(installable)

	return (
		<section className="bg-muted/40 space-y-3.5 border-t px-5 py-5">
			<div className="flex gap-2">
				{PLATFORMS.map(({ id, label }) => (
					<FilterPill
						key={id}
						active={platform === id}
						onClick={() => setPlatform(id)}
					>
						{label}
					</FilterPill>
				))}
			</div>

			<ol className="space-y-3.5">
				{steps.map((step, index) => (
					// The list is rebuilt whole when the platform changes, and a step
					// has no identity of its own beyond its rank.
					<li key={index} className="flex items-start gap-3.5">
						<span className="bg-foreground text-background flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
							{index + 1}
						</span>
						<p className="pt-0.5 text-sm">{step}</p>
					</li>
				))}
			</ol>

			<p className="bg-background text-muted-foreground flex items-start gap-2.5 rounded-xl border p-3.5 text-xs">
				<Info className="mt-0.5 h-4 w-4 shrink-0" />
				<span>
					Sur iPhone, l&apos;ajout se fait depuis le navigateur lui-même : il
					n&apos;y a pas de bouton d&apos;installation dans la page.
				</span>
			</p>
		</section>
	)
}
