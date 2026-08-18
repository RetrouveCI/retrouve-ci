import { Tag, Package } from 'lucide-react'
import type { QrTokenPublicView } from '../servers/qr-contact.service'

interface QrOwnerCardProps {
	token: QrTokenPublicView
}

export function QrOwnerCard({ token }: QrOwnerCardProps) {
	const greeting = token.ownerFirstName
		? `Cet objet appartient à ${token.ownerFirstName}`
		: "Cet objet appartient à quelqu'un"

	return (
		<div className="rounded-2xl border bg-white p-6 shadow-sm">
			<div className="mb-4 flex items-center gap-3">
				<div className="bg-primary-green/10 flex h-12 w-12 items-center justify-center rounded-full">
					<span className="text-primary-green text-2xl">📦</span>
				</div>
				<div>
					<p className="text-muted-foreground text-sm">Sticker RetrouveCI</p>
					<p className="font-semibold">{greeting}</p>
				</div>
			</div>
			{(token.label || token.linkedObject) && (
				<div className="space-y-2 rounded-xl bg-gray-50 p-4">
					{token.label && (
						<div className="flex items-center gap-2 text-sm">
							<Tag className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>{token.label}</span>
						</div>
					)}
					{token.linkedObject && (
						<div className="flex items-center gap-2 text-sm">
							<Package className="text-muted-foreground h-4 w-4 shrink-0" />
							<span>{token.linkedObject}</span>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
