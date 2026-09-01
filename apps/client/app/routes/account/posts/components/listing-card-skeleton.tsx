import { Skeleton } from '@app/ui/components'

/** The loading state of §2.3 rule 5, drawn on the card's own geometry. */
export function ListingCardSkeleton() {
	return (
		<div className="bg-background rounded-2xl border p-3.5">
			<div className="flex gap-3">
				<Skeleton className="h-21 w-21 shrink-0 rounded-xl" />
				<div className="flex min-w-0 flex-1 flex-col gap-2">
					<Skeleton className="h-4 w-3/5" />
					<Skeleton className="h-3 w-4/5" />
					<Skeleton className="mt-auto h-3 w-2/5" />
				</div>
			</div>
		</div>
	)
}
