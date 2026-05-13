'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	QrCode,
	Plus,
	Edit2,
	Power,
	PowerOff,
	Calendar,
	ArrowLeft,
	Shield,
	Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import { Input } from '@retrouve-ci/ui/components/ui/input'
import { Label } from '@retrouve-ci/ui/components/ui/label'
import { Badge } from '@retrouve-ci/ui/components/ui/badge'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@retrouve-ci/ui/components/ui/dialog'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useAuth, type Sticker } from '@/contexts/auth-context'
import { cn } from '@retrouve-ci/ui/lib/utils'
import { redirect } from 'next/navigation'

// Sticker Card Component
function StickerCard({
	sticker,
	onToggle,
	onUpdate,
}: {
	sticker: Sticker
	onToggle: () => void
	onUpdate: (updates: Partial<Sticker>) => void
}) {
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
					? 'border-(primary-green)/20 hover:border-(primary-green)/40'
					: 'border-border opacity-70 hover:opacity-100',
			)}
		>
			{/* Status bar */}
			<div
				className={cn(
					'h-1.5',
					sticker.isActive ? 'bg-(primary-green)' : 'bg-muted',
				)}
			/>

			<div className="p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<div className="mb-3 flex items-center gap-2">
							<div
								className={cn(
									'flex h-10 w-10 items-center justify-center rounded-xl',
									sticker.isActive ? 'bg-(primary-green)/10' : 'bg-muted',
								)}
							>
								<QrCode
									className={cn(
										'h-5 w-5',
										sticker.isActive
											? 'text-(primary-green)'
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
										? 'border-(primary-green)/30 bg-(primary-green)/5 text-(primary-green)'
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

				{/* Actions */}
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
									className="bg-(primary-green) hover:bg-(primary-green-dark) rounded-xl text-white"
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
								: 'border-(primary-green)/20 text-(primary-green) hover:bg-(primary-green)/10',
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

// Activate Sticker Dialog
function ActivateStickerDialog({
	onActivate,
}: {
	onActivate: (code: string, label: string, object?: string) => void
}) {
	const [open, setOpen] = useState(false)
	const [code, setCode] = useState('')
	const [label, setLabel] = useState('')
	const [linkedObject, setLinkedObject] = useState('')

	const handleSubmit = () => {
		if (!code || !label) {
			toast.error('Veuillez remplir le code et le nom')
			return
		}
		onActivate(code.toUpperCase(), label, linkedObject || undefined)
		toast.success('Sticker activé avec succès')
		setCode('')
		setLabel('')
		setLinkedObject('')
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="bg-(primary-green) hover:bg-(primary-green-dark) gap-2 rounded-xl text-white">
					<Plus className="h-4 w-4" />
					Activer un sticker
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Activer un nouveau sticker</DialogTitle>
					<DialogDescription>
						Entrez le code du sticker QR imprimé sur votre étiquette.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="sticker-code">Code du sticker *</Label>
						<Input
							id="sticker-code"
							value={code}
							onChange={e => setCode(e.target.value)}
							placeholder="Ex: RCI-XXXXXX"
							className="h-11 rounded-xl font-mono uppercase"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="sticker-label">Nom / Label *</Label>
						<Input
							id="sticker-label"
							value={label}
							onChange={e => setLabel(e.target.value)}
							placeholder="Ex: Clés de voiture"
							className="h-11 rounded-xl"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="sticker-object">
							Description de l&apos;objet (optionnel)
						</Label>
						<Input
							id="sticker-object"
							value={linkedObject}
							onChange={e => setLinkedObject(e.target.value)}
							placeholder="Ex: Clés Toyota avec porte-clés bleu"
							className="h-11 rounded-xl"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						className="rounded-xl"
					>
						Annuler
					</Button>
					<Button
						onClick={handleSubmit}
						className="bg-(primary-green) hover:bg-(primary-green-dark) rounded-xl text-white"
					>
						Activer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default function StickersPage() {
	const {
		isAuthenticated,
		isLoading,
		stickers,
		activateSticker,
		deactivateSticker,
		updateSticker,
	} = useAuth()

	if (!isLoading && !isAuthenticated) {
		redirect('/auth')
	}

	const activeStickers = stickers.filter(s => s.isActive).length

	const handleToggleSticker = (sticker: Sticker) => {
		if (sticker.isActive) {
			deactivateSticker(sticker.id)
			toast.success('Sticker désactivé')
		} else {
			updateSticker(sticker.id, {
				isActive: true,
				activatedAt: new Date().toISOString().split('T')[0],
			})
			toast.success('Sticker réactivé')
		}
	}

	if (isLoading) {
		return (
			<>
				<Header />
				<main className="flex flex-1 items-center justify-center">
					<div className="border-(primary-green) h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
				</main>
				<Footer />
			</>
		)
	}

	return (
		<>
			<Header />
			<main className="flex-1">
				{/* Header */}
				<section className="relative overflow-hidden border-b">
					<div className="pointer-events-none absolute inset-0">
						<div className="bg-(primary-green)/5 absolute -top-20 right-0 h-96 w-96 rounded-full blur-3xl" />
					</div>
					<div className="relative container mx-auto px-4 py-8">
						<Link
							href="/compte"
							className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							Retour au compte
						</Link>
						<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
							<div className="flex items-center gap-4">
								<div className="bg-(primary-green)/10 flex h-14 w-14 items-center justify-center rounded-2xl">
									<QrCode className="text-(primary-green) h-7 w-7" />
								</div>
								<div>
									<h1 className="text-2xl font-bold">Mes Stickers QR</h1>
									<p className="text-muted-foreground">
										{stickers.length} sticker{stickers.length > 1 ? 's' : ''} ·{' '}
										{activeStickers} actif{activeStickers > 1 ? 's' : ''}
									</p>
								</div>
							</div>
							<ActivateStickerDialog onActivate={activateSticker} />
						</div>
					</div>
				</section>

				{/* Stats bar */}
				<section className="border-b py-4">
					<div className="container mx-auto px-4">
						<div className="flex items-center gap-6 text-sm">
							<div className="flex items-center gap-2">
								<div className="bg-(primary-green) h-2 w-2 rounded-full" />
								<span className="text-muted-foreground">
									Actifs:{' '}
									<span className="text-foreground font-semibold">
										{activeStickers}
									</span>
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="bg-muted-foreground h-2 w-2 rounded-full" />
								<span className="text-muted-foreground">
									Inactifs:{' '}
									<span className="text-foreground font-semibold">
										{stickers.length - activeStickers}
									</span>
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Content */}
				<section className="py-8">
					<div className="container mx-auto px-4">
						{stickers.length > 0 ? (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{stickers.map(sticker => (
									<StickerCard
										key={sticker.id}
										sticker={sticker}
										onToggle={() => handleToggleSticker(sticker)}
										onUpdate={updates => updateSticker(sticker.id, updates)}
									/>
								))}
							</div>
						) : (
							<div className="bg-muted/30 rounded-2xl border-2 border-dashed py-16 text-center">
								<div className="bg-muted mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
									<QrCode className="text-muted-foreground h-8 w-8" />
								</div>
								<h3 className="mb-2 text-lg font-semibold">Aucun sticker</h3>
								<p className="text-muted-foreground mx-auto mb-6 max-w-sm">
									Activez votre premier sticker QR pour protéger vos objets
									précieux.
								</p>
								<ActivateStickerDialog onActivate={activateSticker} />
							</div>
						)}

						{/* Order more */}
						<Link
							href="/stickers/commander"
							className="group border-(primary-green)/30 bg-(primary-green)/5 hover:border-(primary-green)/50 hover:bg-(primary-green)/10 mt-8 flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed p-6 transition-all"
						>
							<div className="flex items-center gap-4">
								<div className="bg-(primary-green) flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
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
								className="border-(primary-green)/30 text-(primary-green) hover:bg-(primary-green)/10 shrink-0 rounded-xl"
							>
								Commander
							</Button>
						</Link>
					</div>
				</section>
			</main>
			<Footer />
		</>
	)
}
