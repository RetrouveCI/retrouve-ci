import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@app/ui/utils'
import { buildResponsiveWindow } from '@/shared/helpers/page-window'

interface PaginationBarProps {
	currentPage: number
	totalPages: number
	onPageChange: (page: number) => void
}

/**
 * Drawn at 40 px with `.touch-target` carrying the 44 px floor (§2.1). The
 * overlay reaches 2 px into each 4 px gap, so neighbouring hit areas meet
 * without overlapping — five numbers plus the two arrows cannot fit inside
 * 360 px if the buttons are 44 px *wide*.
 */
const SLOT = 'touch-target size-chip shrink-0 rounded-xl text-sm font-medium'

const ARROW =
	'bg-background border-border text-muted-foreground hover:border-primary-green/30 hover:text-foreground flex items-center justify-center border transition-all disabled:pointer-events-none disabled:opacity-40'

/**
 * Compact pagination. One button per page ran off the screen as soon as the
 * listing grew: at 360 px the sixth page was already past the edge. The window
 * is `1 … 7 8 9 … 40`, narrowed to `1 … 8 … 40` below `sm`, both drawn from one
 * list of slots so no page number appears twice in the document.
 */
export function PaginationBar({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationBarProps) {
	if (totalPages <= 1) return null

	return (
		<nav aria-label="Pagination" className="mt-10 flex justify-center">
			<div className="flex items-center gap-1 sm:gap-2">
				<button
					type="button"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage <= 1}
					aria-label="Page précédente"
					className={cn(SLOT, ARROW)}
				>
					<ChevronLeft className="h-4 w-4" />
				</button>

				<ul className="flex items-center gap-1">
					{buildResponsiveWindow(currentPage, totalPages).map((slot, index) =>
						slot.kind === 'gap' ? (
							<li
								// Two gaps can stand in one window and neither has an id, so
								// their position is the only thing that tells them apart.
								key={`gap-${index}`}
								aria-hidden
								className={cn(
									'text-muted-foreground flex w-6 shrink-0 justify-center',
									!slot.mobile && 'max-sm:hidden',
									!slot.desktop && 'sm:hidden',
								)}
							>
								<MoreHorizontal className="h-4 w-4" />
							</li>
						) : (
							<li
								key={slot.page}
								className={cn(!slot.mobile && 'max-sm:hidden')}
							>
								<button
									type="button"
									onClick={() => onPageChange(slot.page)}
									aria-label={`Page ${slot.page}`}
									aria-current={slot.page === currentPage ? 'page' : undefined}
									className={cn(
										SLOT,
										'transition-all',
										slot.page === currentPage
											? 'bg-primary-green text-white shadow-sm'
											: 'hover:bg-muted text-muted-foreground',
									)}
								>
									{slot.page}
								</button>
							</li>
						),
					)}
				</ul>

				<button
					type="button"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
					aria-label="Page suivante"
					className={cn(SLOT, ARROW)}
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</nav>
	)
}
