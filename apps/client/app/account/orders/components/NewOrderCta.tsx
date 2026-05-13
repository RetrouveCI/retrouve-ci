import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'

export function NewOrderCta() {
	return (
		<div className="mt-8">
			<Link
				href="/stickers/order"
				className="group border-primary-green/30 bg-primary-green/5 hover:border-primary-green/50 hover:bg-primary-green/10 flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-5 transition-all"
			>
				<div className="flex items-center gap-4">
					<div className="bg-primary-green flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
						<Plus className="h-5 w-5 text-white" />
					</div>
					<div>
						<p className="font-semibold">Nouvelle commande</p>
						<p className="text-muted-foreground text-sm">
							Commander des stickers QR
						</p>
					</div>
				</div>
				<ChevronRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
			</Link>
		</div>
	)
}
