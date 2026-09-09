import { Check, Download } from 'lucide-react'
import { requestInstall } from '@/shared/helpers/install-prompt'
import { useInstallPrompt } from '@/shared/hooks/use-install-prompt'

/**
 * The button appears only where the browser has handed over an install event.
 * Safari never does, and an installed app has spent its own — both land on the
 * instructions below rather than on a button that would do nothing.
 */
export function InstallHero({ installed }: { installed: boolean }) {
	const { installable } = useInstallPrompt()

	return (
		<section className="from-primary-green/8 flex flex-col items-center gap-3.5 bg-gradient-to-b to-transparent px-5 pt-7 pb-6 text-center">
			<img
				src="/icon-192.png"
				alt=""
				width={78}
				height={78}
				className="h-19.5 w-19.5 rounded-[20px]"
			/>
			<h1 className="text-4xl font-bold tracking-tight text-balance">
				RetrouveCI sur votre écran d&apos;accueil
			</h1>
			<p className="text-muted-foreground max-w-75 text-base">
				Pas de store, pas de mise à jour à télécharger. L&apos;app s&apos;ajoute
				depuis cette page.
			</p>

			{installed ? (
				<p className="text-primary-green-text mt-1 flex items-center gap-2 text-base font-semibold">
					<Check className="h-4.5 w-4.5" strokeWidth={2.6} />
					L&apos;application est installée
				</p>
			) : (
				installable && (
					<button
						type="button"
						onClick={() => void requestInstall()}
						className="bg-primary-green hover:bg-primary-green-dark h-control mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold text-white transition-colors"
					>
						<Download className="h-4.5 w-4.5" />
						Installer maintenant
					</button>
				)
			)}
		</section>
	)
}
