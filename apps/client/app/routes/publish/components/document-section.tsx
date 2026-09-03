import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { Controller, useController, useWatch } from 'react-hook-form'
import {
	FieldError,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { InputLabel } from '@app/ui/components/form'
import { IdCard, Lock, Pencil, Plus } from 'lucide-react'
import type { LostItemType } from '@/shared/types/lost-item'
import {
	DOCUMENT_FIELDS,
	DOCUMENT_TYPE_OPTIONS,
	type DocumentIssuerSpec,
} from '@/shared/constants/documents'
import type { PublishFormInput } from '../publish.schema'

interface DocumentSectionProps {
	control: Control<PublishFormInput>
	type: LostItemType
}

/** Cannot collide with an institution's name, unlike a literal « Autre ». */
const OTHER_ISSUER = '__other__'

/** The one sentence that justifies the field, said where the field is. */
function NumberNotice({ type }: { type: LostItemType }) {
	return (
		<p className="text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed">
			<Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
			<span>
				{type === 'found' ? 'Recopiez-le tel qu’il est imprimé. ' : null}
				Il n&apos;apparaît sur aucune page publique. Il sert à rapprocher votre
				annonce et à vérifier à la remise.
			</span>
		</p>
	)
}

interface IssuerFieldProps {
	control: Control<PublishFormInput>
	spec: DocumentIssuerSpec
}

/** A shortcut for the usual institutions, free text for every other. */
function IssuerField({ control, spec }: IssuerFieldProps) {
	const { field, fieldState } = useController({
		control,
		name: 'documentIssuer',
	})

	const { options } = spec
	// A stored name the list never had must open the field on what it holds.
	const [isFree, setIsFree] = useState(
		() => !options || (!!field.value && !options.includes(field.value)),
	)

	return (
		<div className="space-y-2">
			<div className="flex items-baseline justify-between gap-3">
				<InputLabel htmlFor="documentIssuer" className="text-sm">
					{spec.label}
				</InputLabel>
				{options && isFree && (
					<button
						type="button"
						onClick={() => {
							setIsFree(false)
							field.onChange('')
						}}
						className="text-primary-green-text shrink-0 text-xs font-semibold"
					>
						Choisir dans la liste
					</button>
				)}
			</div>

			{options && !isFree ? (
				<Select
					value={field.value ?? ''}
					onValueChange={value => {
						if (!value) return

						if (value === OTHER_ISSUER) {
							setIsFree(true)
							field.onChange('')
							return
						}

						field.onChange(value)
					}}
					onOpenChange={open => !open && field.onBlur()}
				>
					<SelectTrigger
						id="documentIssuer"
						className="h-control w-full text-base"
						aria-invalid={fieldState.invalid || undefined}
					>
						<SelectValue placeholder={spec.placeholder} />
					</SelectTrigger>
					<SelectContent>
						{options.map(option => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
						<SelectItem value={OTHER_ISSUER}>
							<Pencil className="h-3.5 w-3.5" />
							Autre — je saisis le nom
						</SelectItem>
					</SelectContent>
				</Select>
			) : (
				<Input
					{...field}
					id="documentIssuer"
					value={field.value ?? ''}
					placeholder={spec.placeholder}
					className="h-control text-base"
					aria-invalid={fieldState.invalid || undefined}
				/>
			)}

			{fieldState.error && <FieldError errors={[fieldState.error]} />}
		</div>
	)
}

/**
 * Only the holder's name is required: whoever lost their card rarely knows its
 * number. That asymmetry is also why the number sits forward on the « found »
 * side — the piece is in hand there — and folded on the « lost » one.
 */
export function DocumentSection({ control, type }: DocumentSectionProps) {
	const documentType = useWatch({ control, name: 'documentType' })
	const number = useController({ control, name: 'documentNumber' })
	const issuerField = useController({ control, name: 'documentIssuer' })
	const [numberOpen, setNumberOpen] = useState(() =>
		Boolean(number.field.value),
	)

	const spec = documentType ? DOCUMENT_FIELDS[documentType] : null
	const issuer = spec?.issuer ?? null
	const showsNumber = type === 'found' || numberOpen

	return (
		<div className="bg-muted/30 space-y-4 rounded-[14px] border p-4">
			<div className="flex items-center gap-2.5">
				<IdCard className="text-muted-foreground h-4.5 w-4.5 shrink-0" />
				<h3 className="text-sm font-semibold">La pièce</h3>
			</div>

			<Controller
				control={control}
				name="documentType"
				render={({ field, fieldState }) => (
					<div className="space-y-2">
						<InputLabel htmlFor={field.name} className="text-sm">
							Type de pièce
						</InputLabel>
						<Select
							value={field.value ?? ''}
							// Radix answers once with an empty value as it mounts a
							// `Select` that starts with none; `place-step.tsx` guards the
							// same way. Preventive here — the block only appears after a
							// draft is applied, so the call reaches nothing filled.
							onValueChange={value => {
								if (!value || value === field.value) return

								field.onChange(value)
								// Four digits of a bank card are not a policy number, and a
								// bank is not an insurer: neither can carry over.
								number.field.onChange('')
								issuerField.field.onChange('')
							}}
							onOpenChange={open => !open && field.onBlur()}
						>
							<SelectTrigger
								id={field.name}
								className="h-control w-full text-base"
								aria-invalid={fieldState.invalid || undefined}
							>
								<SelectValue placeholder="Sélectionnez la pièce" />
							</SelectTrigger>
							<SelectContent>
								{DOCUMENT_TYPE_OPTIONS.map(option => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{fieldState.error && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>

			{spec && (
				<>
					<Controller
						control={control}
						name="documentHolderName"
						render={({ field, fieldState }) => (
							<div className="space-y-2">
								<InputLabel htmlFor={field.name} required className="text-sm">
									Nom du titulaire
								</InputLabel>
								<Input
									{...field}
									id={field.name}
									value={field.value ?? ''}
									placeholder="Ex : KOUASSI Jean"
									autoComplete="off"
									className="h-control text-base"
									aria-invalid={fieldState.invalid || undefined}
								/>
								<p className="text-muted-foreground text-xs leading-relaxed">
									{type === 'found'
										? 'Le nom imprimé sur la pièce, dans n’importe quel ordre.'
										: 'Le nom imprimé sur la pièce — c’est lui qui la retrouvera.'}
								</p>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</div>
						)}
					/>

					{/* Keyed on the piece, so the shortcut list re-seeds with it. */}
					{issuer && (
						<IssuerField key={documentType} control={control} spec={issuer} />
					)}

					{/* Folded on the « lost » side so no one reads the empty field as a
					    condition for declaring. */}
					{!showsNumber && (
						<button
							type="button"
							onClick={() => setNumberOpen(true)}
							className="border-border hover:bg-muted flex h-11 w-full items-center justify-center gap-2 rounded-[11px] border-[1.5px] text-sm font-semibold transition-colors"
						>
							<Plus className="h-4 w-4" />
							Je connais le numéro
						</button>
					)}

					{showsNumber && (
						<div className="space-y-2">
							<InputLabel htmlFor="documentNumber" className="text-sm">
								{spec.number.label}
							</InputLabel>
							<Input
								{...number.field}
								id="documentNumber"
								value={number.field.value ?? ''}
								placeholder={spec.number.placeholder}
								autoComplete="off"
								inputMode={documentType === 'bank_card' ? 'numeric' : undefined}
								className="h-control text-base"
								aria-invalid={number.fieldState.invalid || undefined}
							/>
							<NumberNotice type={type} />
							{number.fieldState.error && (
								<FieldError errors={[number.fieldState.error]} />
							)}
						</div>
					)}
				</>
			)}
		</div>
	)
}
