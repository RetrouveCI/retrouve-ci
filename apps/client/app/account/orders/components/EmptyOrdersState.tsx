import { Button } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'

export function EmptyOrdersState() {
	return (
		<div className="py-16 text-center">
			<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
				<Package className="text-muted-foreground h-8 w-8" />
			</div>
			<h3 className="mb-2 text-lg font-semibold">Aucune commande</h3>
			<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
				Vous n&apos;avez pas encore passé de commande de stickers QR.
			</p>
			<Button
				asChild
				className="bg-primary-green hover:bg-primary-green-dark h-11 rounded-xl text-white"
			>
				<Link href="/stickers/order" className="gap-2">
					<Plus className="h-4 w-4" />
					Commander des stickers
				</Link>
			</Button>
		</div>
	)
}
