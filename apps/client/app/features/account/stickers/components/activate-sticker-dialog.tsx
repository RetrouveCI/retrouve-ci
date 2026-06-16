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
import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface ActionResult {
	ok: boolean
	error?: string
}

export function ActivateStickerDialog() {
	const fetcher = useFetcher<ActionResult>()
	const [open, setOpen] = useState(false)
	const [code, setCode] = useState('')
	const [label, setLabel] = useState('')
	const [linkedObject, setLinkedObject] = useState('')

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			toast.success('Sticker activé avec succès')
			setCode('')
			setLabel('')
			setLinkedObject('')
			setOpen(false)
		} else {
			toast.error(fetcher.data.error ?? "Impossible d'activer ce sticker")
		}
	}, [fetcher.state, fetcher.data])

	const handleSubmit = () => {
		if (!code || !label) {
			toast.error('Veuillez remplir le code et le nom')
			return
		}
		void fetcher.submit(
			{
				intent: 'activate',
				code: code.toUpperCase(),
				label,
				linkedObject,
			},
			{ method: 'post' },
		)
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
						disabled={fetcher.state !== 'idle'}
						className="bg-primary-green hover:bg-primary-green-dark rounded-xl text-white"
					>
						Activer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
