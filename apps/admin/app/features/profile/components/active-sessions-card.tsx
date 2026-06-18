import { Badge } from '@retrouve-ci/ui/components'
import { Monitor } from 'lucide-react'
import { BentoCard } from '@/shared/components/bento-card'

export function ActiveSessionsCard() {
	return (
		<BentoCard variant="content" className="lg:col-span-1">
			<div className="p-6">
				<div className="mb-4 flex items-center gap-2">
					<Monitor className="text-primary h-5 w-5" />
					<h4 className="text-lg font-semibold">Sessions actives</h4>
				</div>
				<div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
					<div className="mb-3 flex items-center gap-3">
						<div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
							<Monitor className="text-primary h-4 w-4" />
						</div>
						<div>
							<p className="text-sm font-medium">Session actuelle</p>
							<p className="text-muted-foreground text-xs">Navigateur web</p>
						</div>
					</div>
					<p className="text-muted-foreground text-xs">
						Abidjan, Côte d&apos;Ivoire
					</p>
					<Badge
						variant="outline"
						className="bg-primary/10 text-primary border-primary/20 mt-3 text-xs"
					>
						Active
					</Badge>
				</div>
			</div>
		</BentoCard>
	)
}
