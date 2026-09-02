import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Badge,
	Button,
} from '@app/ui/components'
import { useState } from 'react'
import { MoreHorizontal, Pencil, PowerOff, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@app/ui/utils'
import type { Sticker } from '@/shared/types/sticker'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { useSettledSubmission } from '@/shared/hooks/use-settled-submission'
import { stickerStatusFor } from '../helpers/sticker-status'
import { EditStickerDialog } from './edit-sticker-dialog'
import {
	StickerActionsSheet,
	type StickerSheetAction,
} from './sticker-actions-sheet'
import type { stickersAction } from '../servers/stickers.action'

function formatDate(value: string) {
	return new Date(value).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
	})
}

/** A sticker not yet named has no label of its own to show. */
function stickerName(sticker: Sticker) {
	return sticker.label ?? 'Sticker non activé'
}

function buildSubtitle(sticker: Sticker) {
	if (sticker.status === 'generated') return 'Activez-le pour le nommer'

	const activated = sticker.activatedAt
		? ` · activé le ${formatDate(sticker.activatedAt)}`
		: ''

	return `${sticker.code}${activated}`
}

export function StickerCard({ sticker }: { sticker: Sticker }) {
	const fetcher = useActionFetcher<typeof stickersAction>()
	const [menuOpen, setMenuOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const config = stickerStatusFor(sticker.status)
	const isActive = sticker.status === 'activated'

	useSettledSubmission(fetcher.response, result => {
		if (result.success) {
			toast.success('Sticker désactivé')
			return
		}

		toast.error(
			result.errors?.root?.message ?? 'Impossible de désactiver ce sticker',
		)
	})

	const actions: StickerSheetAction[] = isActive
		? [
				{
					label: 'Modifier le sticker',
					icon: Pencil,
					onSelect: () => setEditOpen(true),
				},
				{
					label: 'Désactiver le sticker',
					icon: PowerOff,
					destructive: true,
					onSelect: () => setConfirmOpen(true),
				},
			]
		: []

	return (
		<article
			className={cn(
				'bg-background flex items-center gap-3 rounded-2xl border p-3.5',
				config.border,
				config.dimmed && 'bg-muted/30',
			)}
		>
			<span
				className={cn(
					'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
					isActive ? 'bg-primary-green' : 'bg-muted',
				)}
			>
				<QrCode
					className={cn(
						'h-5.5 w-5.5',
						isActive ? 'text-white' : 'text-muted-foreground',
					)}
				/>
			</span>

			<div className="min-w-0 flex-1">
				<p
					className={cn(
						'truncate text-base font-semibold',
						config.dimmed && 'text-muted-foreground',
					)}
				>
					{stickerName(sticker)}
				</p>
				<p className="text-muted-foreground mt-0.5 truncate text-xs">
					{buildSubtitle(sticker)}
				</p>
				{sticker.linkedObject && (
					<p className="text-muted-foreground mt-0.5 truncate text-xs">
						{sticker.linkedObject}
					</p>
				)}
			</div>

			{config.label && (
				<Badge
					className={cn(
						'h-5.5 shrink-0 text-xs font-bold tracking-[0.04em] uppercase',
						config.badge,
					)}
				>
					{config.label}
				</Badge>
			)}

			{actions.length > 0 && (
				<Button
					variant="ghost"
					size="icon"
					aria-label={`Actions sur ${stickerName(sticker)}`}
					aria-haspopup="dialog"
					disabled={fetcher.isSubmitting}
					onClick={() => setMenuOpen(true)}
					className="touch-target h-9 w-9 shrink-0 rounded-full"
				>
					<MoreHorizontal className="h-4.5 w-4.5" />
				</Button>
			)}

			<StickerActionsSheet
				open={menuOpen}
				onOpenChange={setMenuOpen}
				stickerName={stickerName(sticker)}
				actions={actions}
			/>

			<EditStickerDialog
				sticker={sticker}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Désactiver ce sticker&nbsp;?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible. {sticker.code} ne pourra plus être
							réactivé, et son QR ne mènera plus à vous.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-xl">
							Annuler
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								void fetcher.submit(
									{ intent: 'revoke', code: sticker.code },
									{ method: 'post' },
								)
							}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
						>
							Désactiver
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</article>
	)
}
