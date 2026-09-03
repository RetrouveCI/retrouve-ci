import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@app/ui/components'
import { cn } from '@app/ui/utils'

export interface StickerSheetAction {
	label: string
	icon: React.ElementType
	onSelect: () => void
	destructive?: boolean
}

interface StickerActionsSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	stickerName: string
	actions: StickerSheetAction[]
}

const ROW =
	'flex min-h-13 w-full items-center gap-3 rounded-xl px-3 text-left text-lg font-medium transition-colors hover:bg-muted'

/** The same sheet R13 gives a listing, so both lists of cards read alike. */
export function StickerActionsSheet({
	open,
	onOpenChange,
	stickerName,
	actions,
}: StickerActionsSheetProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="safe-x lg:mx-auto lg:max-w-md lg:rounded-t-2xl">
				<DrawerHeader className="border-b px-4 pt-2 pb-3.5 text-left">
					<DrawerTitle className="truncate text-xl tracking-tight">
						{stickerName}
					</DrawerTitle>
					<DrawerDescription className="text-xs">
						Que voulez-vous faire de ce sticker&nbsp;?
					</DrawerDescription>
				</DrawerHeader>

				<div
					className="flex flex-col gap-1 px-3 py-3"
					style={{
						paddingBottom: 'calc(var(--safe-bottom) + 0.75rem)',
					}}
				>
					{actions.map(({ label, icon: Icon, onSelect, destructive }) => (
						<button
							key={label}
							type="button"
							className={cn(
								ROW,
								// `text-destructive` measures 2,98:1 on the dark background:
								// the token has no ink form yet, so the row names its own pair.
								destructive && 'text-red-700 dark:text-red-400',
							)}
							onClick={() => {
								onOpenChange(false)
								onSelect()
							}}
						>
							<Icon className="h-4.5 w-4.5 shrink-0" />
							{label}
						</button>
					))}
				</div>
			</DrawerContent>
		</Drawer>
	)
}
