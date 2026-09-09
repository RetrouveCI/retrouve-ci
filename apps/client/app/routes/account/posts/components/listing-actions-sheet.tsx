import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@app/ui/components'
import { Link } from 'react-router'
import { cn } from '@app/ui/utils'

export interface ListingSheetAction {
	label: string
	icon: React.ElementType
	/** A destination makes the row a link; otherwise it is a button. */
	to?: string
	onSelect?: () => void
	destructive?: boolean
}

interface ListingActionsSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	listingTitle: string
	actions: ListingSheetAction[]
}

const ROW =
	'flex min-h-13 w-full items-center gap-3 rounded-xl px-3 text-left text-lg font-medium transition-colors hover:bg-muted disabled:opacity-50'

/**
 * The card's four 32 px buttons, gathered into one 44 px target and a sheet
 * (§2.1). The row is what interrupts, so it is a bottom sheet at every width —
 * the same shape « Annonces » gives its filters, capped above `lg` for the same
 * reason.
 */
export function ListingActionsSheet({
	open,
	onOpenChange,
	listingTitle,
	actions,
}: ListingActionsSheetProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="safe-x lg:mx-auto lg:max-w-md lg:rounded-t-2xl">
				<DrawerHeader className="border-b px-4 pt-2 pb-3.5 text-left">
					<DrawerTitle className="truncate text-xl tracking-tight">
						{listingTitle}
					</DrawerTitle>
					<DrawerDescription className="text-xs">
						Que voulez-vous faire de cette annonce&nbsp;?
					</DrawerDescription>
				</DrawerHeader>

				<div
					className="flex flex-col gap-1 px-3 py-3"
					style={{
						paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)',
					}}
				>
					{actions.map(({ label, icon: Icon, to, onSelect, destructive }) =>
						to ? (
							<Link
								key={label}
								to={to}
								className={ROW}
								onClick={() => onOpenChange(false)}
							>
								<Icon className="h-4.5 w-4.5 shrink-0" />
								{label}
							</Link>
						) : (
							<button
								key={label}
								type="button"
								className={cn(
									ROW,
									// `text-destructive` measures 2,98:1 on the dark
									// background: the token has no ink form yet, so the row
									// names its own pair.
									destructive && 'text-red-700 dark:text-red-400',
								)}
								onClick={() => {
									onOpenChange(false)
									onSelect?.()
								}}
							>
								<Icon className="h-4.5 w-4.5 shrink-0" />
								{label}
							</button>
						),
					)}
				</div>
			</DrawerContent>
		</Drawer>
	)
}
