import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@app/ui/components'
import { useState } from 'react'
import { useLocation } from 'react-router'
import { Check, Download } from 'lucide-react'
import { declineInstall, requestInstall } from '@/shared/helpers/install-prompt'
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

/**
 * The one screen the offer never covers: whoever lands there has just scanned a
 * stranger's sticker and is trying to reach its owner. Asking them to install
 * first is the interruption `note-scanav` warns against.
 */
const EXCLUDED = '/q/'

/**
 * Mounted once at the root, so it follows every entry point rather than a
 * chosen few. It waits on the browser: nothing opens until Chromium hands over
 * an install, which it does shortly after `load`.
 */
export function InstallPrompt() {
	const { pathname } = useLocation()
	const { installable, declined } = useInstallPrompt()
	const [closed, setClosed] = useState(false)

	const open =
		!closed && installable && !declined && !pathname.startsWith(EXCLUDED)

	const onInstall = () => {
		setClosed(true)
		void requestInstall()
	}

	// Swiping away dismisses this visit; « Plus tard » settles it for good. A
	// gesture must not close a door the visitor can only reopen from Compte.
	const onLater = () => {
		setClosed(true)
		declineInstall()
	}

	return (
		<Drawer open={open} onOpenChange={next => !next && setClosed(true)}>
			<DrawerContent className="safe-x lg:mx-auto lg:max-w-md lg:rounded-t-2xl">
				<div
					className="space-y-4 px-5 pt-1 pb-5"
					style={{
						paddingBottom: 'calc(var(--safe-bottom) + 1.25rem)',
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
								Ajoutez-la à votre écran d’accueil. Elle s’ouvre plus vite, et
								reste lisible quand le réseau lâche.
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
