import { IdCard } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '../posts.const'
import type { Post } from '../types/posts.types'

interface DocumentLine {
	label: string
	value: string
}

/**
 * The only place the number is ever shown: every public read strips it.
 * Rendered only when the listing carries something.
 */
export function PostDocumentBlock({ post }: { post: Post }) {
	const lines: DocumentLine[] = [
		...(post.documentType
			? [{ label: 'Pièce', value: DOCUMENT_TYPE_LABELS[post.documentType] }]
			: []),
		...(post.documentHolderName
			? [{ label: 'Titulaire', value: post.documentHolderName }]
			: []),
		...(post.documentIssuer
			? [{ label: 'Émetteur', value: post.documentIssuer }]
			: []),
		...(post.documentNumber
			? [{ label: 'Numéro', value: post.documentNumber }]
			: []),
	]

	if (lines.length === 0) return null

	return (
		<div className="bg-muted/40 space-y-3 rounded-xl border p-4">
			<p className="flex items-center gap-2 text-sm font-medium">
				<IdCard className="h-4 w-4" />
				Pièce déclarée
			</p>

			<dl className="grid gap-2 text-sm sm:grid-cols-2">
				{lines.map(({ label, value }) => (
					<div key={label}>
						<dt className="text-muted-foreground text-xs">{label}</dt>
						<dd className="break-words">{value}</dd>
					</div>
				))}
			</dl>

			{post.documentNumber && (
				<p className="text-muted-foreground text-xs">
					Le numéro n&apos;apparaît sur aucune page publique. Il sert au
					rapprochement et à la vérification à la remise.
				</p>
			)}
		</div>
	)
}
