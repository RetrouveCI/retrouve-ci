import { useEffect, useState } from 'react'
import { Button } from '@app/ui/components'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@app/ui/components'
import { Share2, Link2, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { WhatsAppIcon } from './whatsapp-icon'
import {
	buildFacebookUrl,
	buildShareText,
	buildWhatsAppUrl,
	type ShareContent,
} from '../helpers/share-links'

interface ShareMenuProps {
	title: string
	type: 'lost' | 'found'
}

function openShareWindow(url: string) {
	window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600')
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
				{/*
				 * Icon only, because the bar's width belongs to the dominant action.
				 * The label moves to `aria-label`, which is what keeps « Partager »
				 * reachable — a bare glyph would take the name with it.
				 */}
				<Button
					variant="outline"
					aria-label="Partager cette annonce"
					className="h-control w-14 shrink-0 rounded-[14px] border-[1.5px]"
				>
					<Share2 className="h-4.5 w-4.5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" side="top" className="w-52">
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
