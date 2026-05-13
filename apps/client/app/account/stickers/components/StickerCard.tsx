'use client'

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
} from '@retrouve-ci/ui/components'
import { useState } from 'react'
import { QrCode, Edit2, Power, PowerOff, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'
import type { Sticker } from '@/contexts/auth-context'
import { cn } from '@retrouve-ci/ui/utils'

interface StickerCardProps {
	sticker: Sticker
	onToggle: () => void
	onUpdate: (updates: Partial<Sticker>) => void
}

export function StickerCard({ sticker, onToggle, onUpdate }: StickerCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editLabel, setEditLabel] = useState(sticker.label)
	const [editObject, setEditObject] = useState(sticker.linkedObject || '')

	const handleSave = () => {
		onUpdate({ label: editLabel, linkedObject: editObject || undefined })
		setIsEditing(false)
		toast.success('Sticker mis à jour')
	}

	return (
		<div
			className={cn(
				'group bg-background relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg',
				sticker.isActive
					? 'border-primary-green/20 hover:border-primary-green/40'
					: 'border-border opacity-70 hover:opacity-100',
			)}
		>
			<div
				className={cn(
					'h-1.5',
					sticker.isActive ? 'bg-primary-green' : 'bg-muted',
				)}
			/>

			<div className="p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<div className="mb-3 flex items-center gap-2">
							<div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-xl',
									sticker.isActive ? 'bg-primary-green/10' : 'bg-muted',
								)}
							>
								<QrCode
									className={cn(
										'h-5 w-5',
										sticker.isActive
											? 'text-primary-green'
											: 'text-muted-foreground',
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
									sticker.isActive
										? 'border-primary-green/30 bg-primary-green/5 text-primary-green'
										: 'border-muted text-muted-foreground',
								)}
							>
								{sticker.isActive ? 'Actif' : 'Inactif'}
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
								Activé le {sticker.activatedAt}
							</p>
						)}
					</div>
				</div>

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
									className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
								>
									Enregistrer
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<Button
						variant="outline"
						size="sm"
						className={cn(
							'h-9 flex-1 gap-1.5 rounded-xl',
							sticker.isActive
								? 'text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive'
								: 'border-primary-green/20 text-primary-green hover:bg-primary-green/10',
						)}
						onClick={onToggle}
					>
						{sticker.isActive ? (
							<>
								<PowerOff className="h-3.5 w-3.5" />
								Désactiver
							</>
						) : (
							<>
								<Power className="h-3.5 w-3.5" />
								Activer
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	)
}
