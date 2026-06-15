import {
	Button,
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
import { useFetcher, useNavigate } from 'react-router'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { parseWithZod } from '@conform-to/zod'
import { PasswordInput } from '@/features/auth/components/password-input'
import { FieldError } from '@retrouve-ci/ui/components/form'
import { deleteAccountSchema } from '../settings.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

export function DangerZoneSection() {
	const fetcher = useFetcher<ActionResult>()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<string[] | undefined>()

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return

		if (fetcher.data.ok) {
			toast.success('Votre compte a été supprimé')
			navigate('/')
		} else {
			toast.error(fetcher.data.error ?? 'Mot de passe incorrect')
			setPassword('')
		}
	}, [fetcher.state, fetcher.data, navigate])

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) {
			setPassword('')
			setErrors(undefined)
		}
	}

	const handlePasswordChange = (value: string) => {
		setPassword(value)
		setErrors(undefined)
	}

	const isDeleting = fetcher.state !== 'idle'

	const handleConfirm = () => {
		const formData = new FormData()
		formData.set('intent', 'delete-account')
		formData.set('password', password)

		const submission = parseWithZod(formData, { schema: deleteAccountSchema })
		if (submission.status !== 'success') {
			setErrors(submission.error?.password ?? undefined)
			return
		}

		setErrors(undefined)
		void fetcher.submit(submission.value, { method: 'post' })
	}

	return (
		<div className="border-destructive/20 bg-destructive/5 overflow-hidden rounded-2xl border">
			<div className="border-destructive/20 bg-destructive/10 border-b p-5">
				<h2 className="text-destructive flex items-center gap-2 font-semibold">
					<Trash2 className="h-4 w-4" />
					Zone de danger
				</h2>
			</div>
			<div className="space-y-4 p-5">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium">Supprimer mon compte</p>
						<p className="text-muted-foreground text-xs">
							Cette action est irréversible et supprimera toutes vos données.
						</p>
					</div>
					<AlertDialog open={open} onOpenChange={handleOpenChange}>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" className="rounded-xl">
								Supprimer
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
								<AlertDialogDescription>
									Cette action supprimera définitivement votre compte, vos
									annonces et vos stickers. Cette action est irréversible.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="py-2">
								<PasswordInput
									id="delete-account-password"
									label="Confirmez avec votre mot de passe"
									value={password}
									onChange={handlePasswordChange}
									disabled={isDeleting}
								/>
								<FieldError errors={errors} />
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel className="rounded-xl">
									Annuler
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={e => {
										e.preventDefault()
										handleConfirm()
									}}
									disabled={!password || isDeleting}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
								>
									Supprimer mon compte
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	)
}
