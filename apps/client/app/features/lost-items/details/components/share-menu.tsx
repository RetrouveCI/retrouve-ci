import { useEffect, useState } from 'react'
import { Button } from '@retrouve-ci/ui/components'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@retrouve-ci/ui/components'
import { Share2, Link2, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import {
	buildFacebookUrl,
	buildShareText,
	buildWhatsAppUrl,
	type ShareContent,
} from '../lib/share-links'

interface ShareMenuProps {
	title: string
	type: 'lost' | 'found'
}

function openShareWindow(url: string) {
	window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600')
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
			<path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
		</svg>
	)
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
		</svg>
	)
}

export function ShareMenu({ title, type }: ShareMenuProps) {
	const [canNativeShare, setCanNativeShare] = useState(false)

	useEffect(() => {
		setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
	}, [])

	function getShareContent(): ShareContent {
		return {
			url: window.location.href,
			title,
			text: buildShareText(title, type),
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href)
			toast.success('Lien copié dans le presse-papiers.')
		} catch {
			toast.error('Impossible de copier le lien.')
		}
	}

	async function handleNativeShare() {
		try {
			await navigator.share(getShareContent())
		} catch {
			// L'utilisateur a annulé le partage : rien à signaler.
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2">
					<Share2 className="h-4 w-4" />
					Partager
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-52">
				<DropdownMenuItem
					onSelect={() => openShareWindow(buildWhatsAppUrl(getShareContent()))}
				>
					<WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
					WhatsApp
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={() => openShareWindow(buildFacebookUrl(getShareContent()))}
				>
					<FacebookIcon className="h-4 w-4 text-[#1877F2]" />
					Facebook
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{canNativeShare && (
					<DropdownMenuItem onSelect={handleNativeShare}>
						<Smartphone className="h-4 w-4" />
						Plus d&apos;options…
					</DropdownMenuItem>
				)}
				<DropdownMenuItem onSelect={copyLink}>
					<Link2 className="h-4 w-4" />
					Copier le lien
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
