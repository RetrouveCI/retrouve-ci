import { Tag, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QrTokenPublicView } from '../servers/qr-contact.service'

interface QrOwnerCardProps {
	token: QrTokenPublicView
}

interface StickerLineProps {
	icon: LucideIcon
	caption: string
	value: string
}

function StickerLine({ icon: Icon, caption, value }: StickerLineProps) {
	return (
		<div className="flex items-center gap-3">
			<div className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
				<Icon className="text-muted-foreground h-5 w-5" />
			</div>
			<div className="min-w-0">
				<p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
					{caption}
				</p>
				<p className="truncate text-lg font-semibold">{value}</p>
			</div>
		</div>
	)
}

/** Nothing is drawn when the owner named neither the sticker nor the object. */
export function QrOwnerCard({ token }: QrOwnerCardProps) {
	if (!token.label && !token.linkedObject) return null

	return (
		<div className="border-border bg-card space-y-3 rounded-[14px] border p-4">
			{token.label && (
				<StickerLine icon={Tag} caption="Sur le sticker" value={token.label} />
			)}
			{token.linkedObject && (
				<StickerLine
					icon={Package}
					caption="Objet lié"
					value={token.linkedObject}
				/>
			)}
		</div>
	)
}
