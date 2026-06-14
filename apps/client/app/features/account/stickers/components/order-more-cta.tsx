import { Link } from 'react-router'
import { Button } from '@retrouve-ci/ui/components'
import { Shield } from 'lucide-react'

export function OrderMoreCta() {
	return (
		<Link
			to="/stickers/order"
			className="group border-primary-green/30 bg-primary-green/5 hover:border-primary-green/50 hover:bg-primary-green/10 mt-8 flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-6 transition-all"
		>
			<div className="flex items-center gap-4">
				<div className="bg-primary-green flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
					<Shield className="h-6 w-6 text-white" />
				</div>
				<div>
					<p className="font-semibold">Besoin de plus de stickers ?</p>
					<p className="text-muted-foreground text-sm">
						À partir de 1 500 FCFA · Livraison gratuite
					</p>
				</div>
			</div>
			<Button
				variant="outline"
				className="border-primary-green/30 text-primary-green hover:bg-primary-green/10 shrink-0 rounded-xl"
			>
				Commander
			</Button>
		</Link>
	)
}
