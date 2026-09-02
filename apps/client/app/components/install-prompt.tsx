import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@app/ui/components'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Check, Download } from 'lucide-react'
import {
	declineInstall,
	requestInstall,
	SUCCESS_PARAM,
	type InstallCue,
} from '@/shared/helpers/install-prompt'
import { useInstallPrompt } from '@/shared/hooks/use-install-prompt'

const PRIMARY =
	'bg-primary-green hover:bg-primary-green-dark h-control flex w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold text-white transition-colors'

const SECONDARY =
	'text-muted-foreground hover:text-foreground flex h-11 w-full items-center justify-center text-sm font-medium transition-colors'

/** Only what R23 and R24 actually ship — no alert the app cannot deliver. */
const BENEFITS = [
	"Ouverture directe depuis l'écran d'accueil",
	'Les annonces déjà consultées, hors connexion',
	'Aucun store, aucune mise à jour à télécharger',
]

const INTRO: Record<InstallCue, string> = {
	published:
		'Votre annonce est en ligne. Installez l’app pour la suivre sans repasser par le navigateur.',
	activated:
		'Vos stickers sont activés. Installez l’app pour scanner les suivants d’un seul geste.',
}

/**
 * Never at load: the sheet opens only where the URL carries the success it
 * names, which is what makes R25's acceptance a property of the component
 * rather than of each screen that mounts it.
 */
export function InstallPrompt({ after }: { after: InstallCue }) {
	const [searchParams] = useSearchParams()
	const { installable, declined } = useInstallPrompt()
	const [closed, setClosed] = useState(false)

	const open =
		!closed &&
		installable &&
		!declined &&
		searchParams.get(SUCCESS_PARAM) === after

	const onInstall = () => {
		setClosed(true)
		void requestInstall()
	}

	// Swiping away dismisses this moment; « Plus tard » is the answer that
	// settles it for good. A gesture must not close a door the visitor cannot
	// reopen from anywhere but Compte.
	const onLater = () => {
		setClosed(true)
		declineInstall()
	}

	return (
		<Drawer open={open} onOpenChange={next => !next && setClosed(true)}>
			<DrawerContent className="lg:mx-auto lg:max-w-md lg:rounded-t-2xl">
				<div
					className="space-y-4 px-5 pt-1 pb-5"
					style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)',
					}}
				>
					<DrawerHeader className="flex flex-row items-center gap-3.5 p-0 pb-1 text-left">
						<img
							src="/icon-192.png"
							alt=""
							width={60}
							height={60}
							className="h-15 w-15 shrink-0 rounded-2xl"
						/>
						<span className="min-w-0 flex-1">
							<DrawerTitle className="text-2xl tracking-tight">
								Gardez RetrouveCI à portée de pouce
							</DrawerTitle>
							<DrawerDescription className="mt-1 text-sm">
								{INTRO[after]}
							</DrawerDescription>
						</span>
					</DrawerHeader>

					<ul className="bg-muted/40 space-y-2.5 rounded-[14px] border p-3.5">
						{BENEFITS.map(benefit => (
							<li key={benefit} className="flex items-center gap-2.5 text-sm">
								<Check
									className="text-primary-green-text h-4 w-4 shrink-0"
									strokeWidth={2.6}
								/>
								{benefit}
							</li>
						))}
					</ul>

					<div className="space-y-1">
						<button type="button" onClick={onInstall} className={PRIMARY}>
							<Download className="h-4.5 w-4.5" />
							Installer l&apos;application
						</button>
						<button type="button" onClick={onLater} className={SECONDARY}>
							Plus tard
						</button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
