import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Control } from 'react-hook-form'
import { Controller, useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { ChevronDown, Send, CheckCircle2 } from 'lucide-react'
import { FieldError } from '@app/ui/components'
import { FormRootError } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import {
	qrContactSchema,
	type QrContactData,
	type QrContactInput,
} from '../qr-contact.schema'
import type { action } from '../_index'

/**
 * `text-field` is 16 px by role, not by rung: under it iOS zooms on focus, and
 * this is the screen a finder reaches from their camera with no account and no
 * second chance. R33 moved the ladder; this floor did not move with it.
 */
const CONTROL_CLASSNAME =
	'bg-background border-border focus:border-primary-green focus:ring-primary-green/25 w-full rounded-[14px] border-[1.5px] px-4 text-field transition-colors outline-none focus:ring-2'

const INITIAL_VALUES: QrContactInput = {
	name: '',
	phone: '',
	email: '',
	message: '',
}

interface TextFieldProps {
	control: Control<QrContactInput>
	name: 'name' | 'phone' | 'email'
	label: ReactNode
	placeholder: string
	type?: 'text' | 'tel' | 'email'
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
						className={cn('h-control', CONTROL_CLASSNAME)}
					/>
					{fieldState.error && (
						<FieldError errors={[fieldState.error]} className="text-xs" />
					)}
				</div>
			)}
		/>
	)
}

export function QrContactForm() {
	const fetcher = useActionFetcher<typeof action, QrContactInput>()
	const [showEmail, setShowEmail] = useState(false)

	const form = useForm<QrContactInput, unknown, QrContactData>({
		resolver: standardSchemaResolver(qrContactSchema),
		mode: 'onSubmit',
		errors: fetcher.errors,
		reValidateMode: 'onChange',
		defaultValues: INITIAL_VALUES,
	})

	const onSubmit = (values: QrContactData) => {
		// An absent optional field would be posted as the string "undefined", which
		// the schema then rejects as a malformed email.
		void fetcher.submit(
			{ ...values, email: values.email ?? '' },
			{
				method: 'post',
			},
		)
	}

	if (fetcher.isOk) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
				<div className="bg-primary-green/10 flex h-16 w-16 items-center justify-center rounded-full">
					<CheckCircle2 className="text-primary-green-text h-8 w-8" />
				</div>
				<div>
					<p className="mb-1 text-lg font-semibold">Message envoyé !</p>
					<p className="text-muted-foreground text-sm">
						Le propriétaire a été notifié et vous contactera bientôt.
					</p>
				</div>
			</div>
		)
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="space-y-5"
		>
			<FormRootError
				title="Impossible d'envoyer le message"
				message={form.formState.errors.root?.message}
			/>

			<Controller
				control={form.control}
				name="message"
				render={({ field, fieldState }) => (
					<div className="space-y-1.5">
						<div className="flex items-baseline justify-between gap-3">
							<label htmlFor={field.name} className="text-sm font-medium">
								Où peut-il le récupérer&nbsp;?
							</label>
							<span className="text-muted-foreground text-xs">Obligatoire</span>
						</div>
						<textarea
							{...field}
							id={field.name}
							rows={3}
							value={field.value ?? ''}
							placeholder="Ex. : je l'ai déposé à la pharmacie du carrefour…"
							className={cn('min-h-22 resize-none py-3.5', CONTROL_CLASSNAME)}
						/>
						{fieldState.error && (
							<FieldError errors={[fieldState.error]} className="text-xs" />
						)}
					</div>
				)}
			/>

			<div className="space-y-3">
				<p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
					Pour qu&apos;il vous rappelle
				</p>
				<TextField
					control={form.control}
					name="name"
					label="Votre nom"
					placeholder="Konan Yao"
				/>
				<TextField
					control={form.control}
					name="phone"
					label="Téléphone"
					type="tel"
					placeholder="07 00 00 00 00"
				/>

				{showEmail || form.formState.errors.email ? (
					<TextField
						control={form.control}
						name="email"
						label={
							<>
								Email{' '}
								<span className="text-muted-foreground font-normal">
									(facultatif)
								</span>
							</>
						}
						type="email"
						placeholder="vous@exemple.ci"
					/>
				) : (
					<button
						type="button"
						onClick={() => setShowEmail(true)}
						aria-expanded={false}
						className="text-muted-foreground hover:text-foreground flex h-11 items-center gap-1.5 text-sm transition-colors"
					>
						Ajouter un email (facultatif)
						<ChevronDown className="h-4 w-4" />
					</button>
				)}
			</div>

			<button
				type="submit"
				disabled={fetcher.isSubmitting}
				className="bg-primary-green hover:bg-primary-green-dark h-control flex w-full items-center justify-center gap-2 rounded-[14px] text-base font-semibold text-white transition-colors disabled:opacity-70"
			>
				<Send className="h-4 w-4" />
				{fetcher.isSubmitting ? 'Envoi en cours…' : 'Envoyer le message'}
			</button>
		</form>
	)
}
