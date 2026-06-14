import {
	Button,
	Input,
	Label,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@retrouve-ci/ui/components'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ActivateStickerDialogProps {
	onActivate: (code: string, label: string, object?: string) => void
}

export function ActivateStickerDialog({
	onActivate,
}: ActivateStickerDialogProps) {
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
				<Button className="bg-primary-green hover:bg-primary-green-dark gap-2 rounded-xl text-white">
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
						className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
					>
						Activer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
