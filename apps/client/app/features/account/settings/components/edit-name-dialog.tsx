import { useEffect, useState } from 'react'
import { useFetcher } from 'react-router'
import { useForm, getInputProps, getFormProps } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
} from '@retrouve-ci/ui/components'
import { InputLabel, FieldError } from '@retrouve-ci/ui/components/form'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { updateNameSchema } from '../settings.schema'

interface ActionResult {
	ok: boolean
	error?: string
}

export function EditNameDialog({ currentName }: { currentName: string }) {
	const fetcher = useFetcher<ActionResult>()
	const [open, setOpen] = useState(false)
	const isSaving = fetcher.state !== 'idle'

	const [form, fields] = useForm({
		id: 'update-name-form',
		constraint: getZodConstraint(updateNameSchema),
		defaultValue: { name: currentName },
		shouldValidate: 'onBlur',
		shouldRevalidate: 'onInput',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: updateNameSchema })
		},
	})

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok) {
			toast.success('Nom mis à jour')
			setOpen(false)
		} else {
			toast.error(fetcher.data.error ?? 'Une erreur est survenue')
		}
	}, [fetcher.state, fetcher.data])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="rounded-lg text-xs">
					Modifier
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nom et prénoms</DialogTitle>
					<DialogDescription className="sr-only">
						Modifier votre nom et prénoms
					</DialogDescription>
				</DialogHeader>
				<fetcher.Form
					method="post"
					{...getFormProps(form)}
					className="space-y-4"
				>
					<input type="hidden" name="intent" value="update-name" />
					<div className="space-y-2">
						<InputLabel htmlFor={fields.name.id}>Nom et prénoms</InputLabel>
						<Input
							{...getInputProps(fields.name, { type: 'text' })}
							key={fields.name.key}
							placeholder="Ex : Adjoua Konan"
							className="h-11"
						/>
						<FieldError errors={fields.name.errors} />
					</div>
					<Button
						type="submit"
						disabled={isSaving}
						className="bg-primary-green hover:bg-primary-green-dark h-11 w-full gap-2 rounded-xl text-white"
					>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Enregistrement...
							</>
						) : (
							<>
								<Check className="h-4 w-4" />
								Enregistrer
							</>
						)}
					</Button>
				</fetcher.Form>
			</DialogContent>
		</Dialog>
	)
}
