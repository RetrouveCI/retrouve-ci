import { useEffect, useState } from 'react'
import type { Control } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Send, CheckCircle2 } from 'lucide-react'
import { FieldError } from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	createContactMessageSchema,
	type CreateContactMessageData,
	type CreateContactMessageInput,
} from '@app/contracts/contact-messages'
import type { action } from '../_index'

const CONTROL_CLASSNAME =
	'bg-muted/30 focus:border-primary-green/50 focus:ring-primary-green/30 w-full rounded-xl border px-4 text-sm transition-all outline-none focus:ring-2'

const INITIAL_VALUES: CreateContactMessageInput = {
	name: '',
	email: '',
	subject: '',
	message: '',
}

interface TextFieldProps {
	control: Control<CreateContactMessageInput>
	name: 'name' | 'email' | 'subject'
	label: string
	placeholder: string
	type?: 'text' | 'email'
}

function TextField({
	control,
	name,
	label,
	placeholder,
	type = 'text',
}: TextFieldProps) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<div className="space-y-1.5">
					<label htmlFor={field.name} className="text-sm font-medium">
						{label}
					</label>
					<input
						{...field}
						id={field.name}
						type={type}
						value={field.value ?? ''}
						placeholder={placeholder}
						className={cn('h-11', CONTROL_CLASSNAME)}
					/>
					{fieldState.error && (
						<FieldError errors={[fieldState.error]} className="text-xs" />
					)}
				</div>
			)}
		/>
	)
}

export function ContactForm() {
	const [submitted, setSubmitted] = useState(false)

	const fetcher = useActionFetcher<typeof action, CreateContactMessageInput>()

	const form = useForm<
		CreateContactMessageInput,
		unknown,
		CreateContactMessageData
	>({
		resolver: standardSchemaResolver(createContactMessageSchema),
		mode: 'onSubmit',
		errors: fetcher.errors,
		reValidateMode: 'onChange',
		defaultValues: INITIAL_VALUES,
	})

	useEffect(() => {
		if (!fetcher.isOk) return
		setSubmitted(true)
	}, [fetcher.isOk])

	const onSubmit = (values: CreateContactMessageData) => {
		void fetcher.submit(values, { method: 'post' })
	}

	if (submitted) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<div className="bg-primary-green/10 flex h-16 w-16 items-center justify-center rounded-full">
					<CheckCircle2 className="text-primary-green h-8 w-8" />
				</div>
				<div>
					<p className="mb-1 text-lg font-semibold">Message envoyé !</p>
					<p className="text-muted-foreground text-sm">
						Nous vous répondrons dans les 24 heures.
					</p>
				</div>
				<button
					onClick={() => {
						setSubmitted(false)
						form.reset()
					}}
					className="text-primary-green text-sm hover:underline"
				>
					Envoyer un autre message
				</button>
			</div>
		)
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-4"
		>
			<FormRootError message={form.formState.errors.root?.message} />

			<div className="grid grid-cols-2 gap-4">
				<TextField
					control={form.control}
					name="name"
					label="Nom complet"
					placeholder="Konan Yao"
				/>
				<TextField
					control={form.control}
					name="email"
					label="Email"
					type="email"
					placeholder="vous@exemple.ci"
				/>
			</div>

			<TextField
				control={form.control}
				name="subject"
				label="Sujet"
				placeholder="Comment pouvons-nous vous aider ?"
			/>

			<Controller
				control={form.control}
				name="message"
				render={({ field, fieldState }) => (
					<div className="space-y-1.5">
						<label htmlFor={field.name} className="text-sm font-medium">
							Message
						</label>
						<textarea
							{...field}
							id={field.name}
							rows={5}
							value={field.value ?? ''}
							placeholder="Décrivez votre demande..."
							className={cn('resize-none py-3', CONTROL_CLASSNAME)}
						/>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>

			<button
				type="submit"
				disabled={fetcher.isSubmitting}
				className="bg-primary-green hover:bg-primary-green-dark flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-70"
			>
				<Send className="h-4 w-4" />
				{fetcher.isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
			</button>
		</form>
	)
}
