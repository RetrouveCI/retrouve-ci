import {
	Button,
	Input,
	Label,
	Badge,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@retrouve-ci/ui/components'
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { QrCode, Edit2, PowerOff, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'
import type { Sticker } from '@/shared/types/sticker'
import { cn } from '@retrouve-ci/ui/utils'

interface ActionResult {
	ok: boolean
	error?: string
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

interface StickerCardProps {
	sticker: Sticker
}

export function StickerCard({ sticker }: StickerCardProps) {
	const updateFetcher = useFetcher<ActionResult>()
	const revokeFetcher = useFetcher<ActionResult>()
	const [isEditing, setIsEditing] = useState(false)
	const [editLabel, setEditLabel] = useState(sticker.label ?? '')
	const [editObject, setEditObject] = useState(sticker.linkedObject ?? '')

	useEffect(() => {
		if (updateFetcher.state !== 'idle' || !updateFetcher.data) return

		if (updateFetcher.data.ok) {
			setIsEditing(false)
			toast.success('Sticker mis à jour')
		} else {
			toast.error(updateFetcher.data.error ?? 'Une erreur est survenue')
		}
	}, [updateFetcher.state, updateFetcher.data])

	useEffect(() => {
		if (revokeFetcher.state !== 'idle' || !revokeFetcher.data) return

		if (revokeFetcher.data.ok) {
			toast.success('Sticker désactivé')
		} else {
			toast.error(revokeFetcher.data.error ?? 'Une erreur est survenue')
		}
	}, [revokeFetcher.state, revokeFetcher.data])

	const handleSave = () => {
		void updateFetcher.submit(
			{
				intent: 'update',
				code: sticker.code,
				label: editLabel,
				linkedObject: editObject,
			},
			{ method: 'post' },
		)
	}

	const handleRevoke = () => {
		void revokeFetcher.submit(
			{ intent: 'revoke', code: sticker.code },
			{ method: 'post' },
		)
	}

	const isActive = sticker.status === 'activated'
	const isUpdating = updateFetcher.state !== 'idle'
	const isRevoking = revokeFetcher.state !== 'idle'

	return (
		<div
			className={cn(
				'group bg-background relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg',
				isActive
					? 'border-primary-green/20 hover:border-primary-green/40'
					: 'border-border opacity-70 hover:opacity-100',
			)}
		>
			<div
				className={cn('h-1.5', isActive ? 'bg-primary-green' : 'bg-muted')}
			/>

			<div className="p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<div className="mb-3 flex items-center gap-2">
							<div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-xl',
									isActive ? 'bg-primary-green/10' : 'bg-muted',
								)}
							>
								<QrCode
									className={cn(
										'h-5 w-5',
										isActive ? 'text-primary-green' : 'text-muted-foreground',
									)}
								/>
							</div>
							<div>
								<code className="text-muted-foreground bg-muted rounded px-2 py-0.5 font-mono text-xs">
									{sticker.code}
								</code>
							</div>
							<Badge
								variant="outline"
								className={cn(
									'ml-auto text-[10px]',
									isActive
										? 'border-primary-green/30 bg-primary-green/5 text-primary-green'
										: 'border-muted text-muted-foreground',
								)}
							>
								{isActive ? 'Actif' : 'Désactivé'}
							</Badge>
						</div>
						<h4 className="truncate text-lg font-semibold">{sticker.label}</h4>
						{sticker.linkedObject && (
							<p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 truncate text-sm">
								<Package className="h-3.5 w-3.5" />
								{sticker.linkedObject}
							</p>
						)}
						{sticker.activatedAt && (
							<p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
								<Calendar className="h-3.5 w-3.5" />
								Activé le {formatDate(sticker.activatedAt)}
							</p>
						)}
					</div>
				</div>

				{isActive && (
					<div className="mt-4 flex items-center gap-2 border-t pt-4">
						<Dialog open={isEditing} onOpenChange={setIsEditing}>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									className="h-9 flex-1 gap-1.5 rounded-xl"
								>
									<Edit2 className="h-3.5 w-3.5" />
									Modifier
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Modifier le sticker</DialogTitle>
									<DialogDescription>
										Modifiez les informations de votre sticker {sticker.code}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="label">Nom / Label</Label>
										<Input
											id="label"
											value={editLabel}
											onChange={e => setEditLabel(e.target.value)}
											placeholder="Ex: Clés de maison"
											className="h-11 rounded-xl"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="object">Description de l&apos;objet</Label>
										<Input
											id="object"
											value={editObject}
											onChange={e => setEditObject(e.target.value)}
											placeholder="Ex: Trousseau avec 3 clés"
											className="h-11 rounded-xl"
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setIsEditing(false)}
										className="rounded-xl"
									>
										Annuler
									</Button>
									<Button
										onClick={handleSave}
										disabled={isUpdating}
										className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
									>
										Enregistrer
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									disabled={isRevoking}
									className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive h-9 flex-1 gap-1.5 rounded-xl"
								>
									<PowerOff className="h-3.5 w-3.5" />
									Désactiver
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Désactiver ce sticker ?</AlertDialogTitle>
									<AlertDialogDescription>
										Cette action est irréversible. Le sticker {sticker.code}
										ne pourra plus être réactivé.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="rounded-xl">
										Annuler
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleRevoke}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
									>
										Désactiver
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				)}
			</div>
		</div>
	)
}
