import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Controller, useController, useForm, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { toast } from 'sonner'
import {
	BellOff,
	CheckCircle2,
	ImagePlus,
	Loader2,
	Pencil,
	Search,
	X,
} from 'lucide-react'
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Checkbox,
	Field,
	FieldError,
	FieldLabel,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@app/ui/components'
import { cn } from '@app/ui/utils'
import {
	DOCUMENT_FIELDS,
	DOCUMENT_TYPE_OPTIONS,
	LOST_ITEM_CATEGORIES,
	MAX_PHOTOS,
	refusesPhotos,
	type DocumentIssuerSpec,
} from '@app/contracts/lost-items'
import {
	ABIDJAN_COMMUNES,
	CI_VILLES,
	COMMUNE_CITY,
} from '@app/contracts/shared'
import {
	FormInputField,
	FormRootError,
	FormTextareaField,
} from '@app/ui/components/form'
import { useActionFetcher } from '@/shared/hooks/use-action-fetcher'
import { CATEGORY_LABELS } from '../../posts.const'
import type { Post } from '../../types/posts.types'
import {
	newPostSchema,
	type NewPostData,
	type NewPostInput,
} from '../new-post.schema'
import {
	ALLOWED_PHOTO_TYPES,
	MAX_PHOTO_SIZE,
	TYPE_OPTIONS,
} from '../new-post.const'
import type { action } from '../_index'

const DEFAULT_VALUES: NewPostInput = {
	type: 'found',
	category: '',
	title: '',
	description: '',
	ville: '',
	commune: '',
	eventDate: '',
	contactName: 'Équipe RetrouveCI',
	contactWhatsapp: '',
	documentType: '',
	documentHolderName: '',
	documentNumber: '',
	documentIssuer: '',
	postedFor: '',
}

const PIECE_FIELDS = [
	'documentType',
	'documentHolderName',
	'documentNumber',
	'documentIssuer',
] as const

function Section({
	step,
	title,
	hint,
	children,
}: {
	step: string
	title: string
	hint?: string
	children: React.ReactNode
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<span className="bg-primary-green/10 text-primary-green-text rounded px-1.5 font-mono text-xs">
						{step}
					</span>
					{title}
				</CardTitle>
				{hint && <CardDescription>{hint}</CardDescription>}
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	)
}

/** Cannot collide with an institution's name, unlike a literal « Autre ». */
const OTHER_ISSUER = '__other__'

/** A shortcut list for the usual institutions, free text for every other. */
function IssuerField({
	control,
	spec,
}: {
	control: Control<NewPostInput, unknown, NewPostData>
	spec: DocumentIssuerSpec
}) {
	const { field, fieldState } = useController({
		control,
		name: 'documentIssuer',
	})
	const { options } = spec
	const [isFree, setIsFree] = useState(
		() => !options || (!!field.value && !options.includes(field.value)),
	)

	return (
		<Field data-invalid={fieldState.invalid}>
			<div className="flex items-baseline justify-between gap-3">
				<FieldLabel htmlFor="documentIssuer">{spec.label}</FieldLabel>
				{options && isFree && (
					<button
						type="button"
						onClick={() => {
							setIsFree(false)
							field.onChange('')
						}}
						className="text-primary-green-text text-xs font-semibold"
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
						className="w-full"
						aria-invalid={fieldState.invalid}
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
					aria-invalid={fieldState.invalid}
				/>
			)}
			{fieldState.error && <FieldError errors={[fieldState.error]} />}
		</Field>
	)
}

function Note({ children }: { children: React.ReactNode }) {
	return <p className="text-muted-foreground -mt-2 text-xs">{children}</p>
}

/**
 * The public form's fields and rules on one page. Its three steps exist for a
 * thumb on a phone; at a desk they only add clicks, so each section keeps the
 * number of the public step it comes from instead.
 */
export function NewPostForm() {
	const navigate = useNavigate()
	const submitted = useRef(false)
	const fetcher = useActionFetcher<typeof action, NewPostInput, Post>()

	const form = useForm<NewPostInput, unknown, NewPostData>({
		resolver: standardSchemaResolver(newPostSchema),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
		defaultValues: DEFAULT_VALUES,
		errors: fetcher.errors,
	})

	const category = useWatch({ control: form.control, name: 'category' })
	const isDocument = category === 'documents'
	const [carriesPiece, setCarriesPiece] = useState(false)
	const showPiece = isDocument || carriesPiece

	// The public form's rules: a new city clears the commune, a new piece its
	// number and its issuer — so those handlers reach another field.
	const ville = useController({ control: form.control, name: 'ville' })
	const commune = useController({ control: form.control, name: 'commune' })
	const documentType = useController({
		control: form.control,
		name: 'documentType',
	})
	const hasCommunes = ville.field.value === COMMUNE_CITY
	const spec = documentType.field.value
		? DOCUMENT_FIELDS[documentType.field.value]
		: null

	const [files, setFiles] = useState<File[]>([])
	const [photoError, setPhotoError] = useState<string | null>(null)
	const previews = useMemo(
		() => files.map(file => URL.createObjectURL(file)),
		[files],
	)
	useEffect(
		() => () => previews.forEach(url => URL.revokeObjectURL(url)),
		[previews],
	)

	useEffect(() => {
		if (!submitted.current || !fetcher.isOk) return

		submitted.current = false
		toast.success('Annonce publiée — elle est déjà visible')
		void navigate('/posts')
	}, [fetcher.isOk, navigate])

	const addFiles = (list: FileList | null) => {
		if (!list) return

		const incoming = [...list]
		const fits = (file: File) =>
			ALLOWED_PHOTO_TYPES.includes(file.type) && file.size <= MAX_PHOTO_SIZE

		setPhotoError(
			incoming.every(fits) ? null : 'Photos JPEG, PNG ou WebP de 5 Mo au plus.',
		)
		setFiles(current =>
			[...current, ...incoming.filter(fits)].slice(0, MAX_PHOTOS),
		)
	}

	const togglePiece = (checked: boolean) => {
		setCarriesPiece(checked)
		if (!checked) for (const name of PIECE_FIELDS) form.setValue(name, '')
	}

	const onSubmit = (values: NewPostData) => {
		const body = new FormData()
		for (const [name, value] of Object.entries(form.getValues())) {
			body.set(name, String(value ?? ''))
		}
		if (!refusesPhotos(values.category)) {
			for (const file of files) body.append('photos', file)
		}

		submitted.current = true
		void fetcher.submit(body, {
			method: 'post',
			encType: 'multipart/form-data',
		})
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			noValidate
			className="grid items-start gap-4 lg:grid-cols-[1fr_300px]"
		>
			<div className="space-y-4">
				<FormRootError
					title="Impossible de publier l’annonce"
					message={form.formState.errors.root?.message}
				/>

				<Section step="1" title="Type d’annonce">
					<Controller
						control={form.control}
						name="type"
						render={({ field }) => (
							<div
								role="radiogroup"
								aria-label="Type d’annonce"
								className="grid gap-2 sm:grid-cols-2"
							>
								{TYPE_OPTIONS.map(option => (
									<button
										key={option.value}
										type="button"
										role="radio"
										aria-checked={field.value === option.value}
										onClick={() => field.onChange(option.value)}
										className={cn(
											'rounded-lg border p-3 text-left transition-colors',
											field.value === option.value
												? 'border-primary-green bg-primary-green/5'
												: 'hover:bg-muted/50',
										)}
									>
										<span className="block text-sm font-semibold">
											{option.label}
										</span>
										<span className="text-muted-foreground block text-xs">
											{option.hint}
										</span>
									</button>
								))}
							</div>
						)}
					/>
				</Section>

				<Section step="2" title="L’objet" hint="Étape 1 du formulaire public">
					<Controller
						control={form.control}
						name="category"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Catégorie</FieldLabel>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									onOpenChange={open => !open && field.onBlur()}
								>
									<SelectTrigger
										id={field.name}
										aria-invalid={fieldState.invalid}
									>
										<SelectValue placeholder="Choisir une catégorie" />
									</SelectTrigger>
									<SelectContent>
										{LOST_ITEM_CATEGORIES.map(value => (
											<SelectItem key={value} value={value}>
												{CATEGORY_LABELS[value]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
					<FormInputField
						control={form.control}
						name="title"
						label="Titre"
						required
						maxLength={120}
					/>
					<FormTextareaField
						control={form.control}
						name="description"
						label="Description"
						placeholder="Où, quand, dans quel état — ce qui permet de le reconnaître."
					/>
					<Note>
						20 caractères au moins, sauf pour une pièce d’identité : son type et
						son titulaire suffisent.
					</Note>
				</Section>

				{!isDocument && (
					<Field orientation="horizontal" className="gap-2 px-1">
						<Checkbox
							id="carries-piece"
							checked={carriesPiece}
							onCheckedChange={checked => togglePiece(checked === true)}
						/>
						<FieldLabel htmlFor="carries-piece" className="cursor-pointer">
							L’objet contient une pièce d’identité
						</FieldLabel>
					</Field>
				)}

				{showPiece && (
					<Section
						step="3"
						title="La pièce"
						hint="Le nom du titulaire est ce qui pèse le plus dans le rapprochement."
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field data-invalid={documentType.fieldState.invalid}>
								<FieldLabel htmlFor="documentType">Type de pièce</FieldLabel>
								<Select
									value={documentType.field.value ?? ''}
									// Radix answers once with an empty value as it mounts a `Select`
									// that starts with none; the public form guards the same way.
									onValueChange={value => {
										if (!value || value === documentType.field.value) return

										documentType.field.onChange(value)
										// A bank card's digits are not a policy number, and a bank is
										// not an insurer: neither carries over.
										form.setValue('documentNumber', '')
										form.setValue('documentIssuer', '')
									}}
									onOpenChange={open => !open && documentType.field.onBlur()}
								>
									<SelectTrigger
										id="documentType"
										className="w-full"
										aria-invalid={documentType.fieldState.invalid}
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
								{documentType.fieldState.error && (
									<FieldError errors={[documentType.fieldState.error]} />
								)}
							</Field>
							{spec && (
								<>
									<FormInputField
										control={form.control}
										name="documentHolderName"
										label="Nom du titulaire"
										placeholder="Ex : KOUASSI Jean"
										required
									/>
									<FormInputField
										control={form.control}
										name="documentNumber"
										label={spec.number.label}
										placeholder={spec.number.placeholder}
										inputMode={
											documentType.field.value === 'bank_card'
												? 'numeric'
												: undefined
										}
									/>
									{/* Keyed on the piece, so the shortcut list re-seeds with it. */}
									{spec.issuer && (
										<IssuerField
											key={documentType.field.value}
											control={form.control}
											spec={spec.issuer}
										/>
									)}
								</>
							)}
						</div>
						<Note>
							Le numéro n’est jamais affiché publiquement : il sert au
							rapprochement.
						</Note>
					</Section>
				)}

				{isDocument ? (
					<p className="text-muted-foreground px-1 text-xs">
						Une annonce de pièce d’identité est publiée sans photo : le type et
						le nom du titulaire suffisent à la retrouver.
					</p>
				) : (
					<Section step="4" title="Photos" hint={`Jusqu’à ${MAX_PHOTOS}.`}>
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
							{previews.map((url, index) => (
								<div
									key={url}
									className="bg-muted relative aspect-square overflow-hidden rounded-md border"
								>
									<img
										src={url}
										alt=""
										className="h-full w-full object-cover"
									/>
									<button
										type="button"
										aria-label={`Retirer la photo ${index + 1}`}
										onClick={() =>
											setFiles(current => current.filter((_, i) => i !== index))
										}
										className="bg-background/90 absolute top-1 right-1 rounded-full border p-0.5"
									>
										<X className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
							{files.length < MAX_PHOTOS && (
								<label className="hover:border-primary-green text-muted-foreground flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs">
									<ImagePlus className="h-4 w-4" />
									Ajouter
									<input
										type="file"
										accept={ALLOWED_PHOTO_TYPES.join(',')}
										multiple
										className="sr-only"
										onChange={event => {
											addFiles(event.target.files)
											event.target.value = ''
										}}
									/>
								</label>
							)}
						</div>
						{photoError && (
							<p role="alert" className="text-destructive text-xs">
								{photoError}
							</p>
						)}
					</Section>
				)}

				<Section
					step="5"
					title="Le lieu et la date"
					hint="Étape 2 du formulaire public"
				>
					<div className="grid gap-4 sm:grid-cols-3">
						<Field data-invalid={ville.fieldState.invalid}>
							<FieldLabel htmlFor="ville">
								Ville <span className="text-destructive">*</span>
							</FieldLabel>
							<Select
								value={ville.field.value ?? ''}
								// Radix answers once with an empty value as it mounts; taken
								// at face value it reads as « the city changed ».
								onValueChange={value => {
									if (!value || value === ville.field.value) return

									ville.field.onChange(value)
									commune.field.onChange('')
								}}
								onOpenChange={open => !open && ville.field.onBlur()}
							>
								<SelectTrigger
									id="ville"
									className="w-full"
									aria-invalid={ville.fieldState.invalid}
								>
									<SelectValue placeholder="Sélectionnez une ville" />
								</SelectTrigger>
								<SelectContent>
									{CI_VILLES.map(city => (
										<SelectItem key={city} value={city}>
											{city}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{ville.fieldState.error && (
								<FieldError errors={[ville.fieldState.error]} />
							)}
						</Field>
						<Field>
							<FieldLabel htmlFor="commune">Commune (facultatif)</FieldLabel>
							<Select
								value={commune.field.value ?? ''}
								onValueChange={value => value && commune.field.onChange(value)}
								onOpenChange={open => !open && commune.field.onBlur()}
								disabled={!hasCommunes}
							>
								<SelectTrigger id="commune" className="w-full">
									<SelectValue
										placeholder={
											hasCommunes
												? 'Sélectionnez une commune'
												: 'Abidjan seulement'
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{ABIDJAN_COMMUNES.map(name => (
										<SelectItem key={name} value={name}>
											{name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<FormInputField
							control={form.control}
							name="eventDate"
							label="Date des faits"
							type="date"
							required
						/>
					</div>
				</Section>

				<Section
					step="6"
					title="Le contact"
					hint="Étape 3 du formulaire public"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<FormInputField
							control={form.control}
							name="contactName"
							label="Nom affiché"
							required
						/>
						<FormInputField
							control={form.control}
							name="contactWhatsapp"
							label="Numéro WhatsApp"
							type="tel"
							inputMode="tel"
							placeholder="07 XX XX XX XX"
							required
						/>
					</div>
					<Note>
						La ligne de l’équipe, ou celle de la personne à joindre directement.
					</Note>
					<FormInputField
						control={form.control}
						name="postedFor"
						label="Déposée pour (optionnel)"
						placeholder="La personne au nom de qui l’équipe publie"
					/>
					<Note>
						Jamais affiché publiquement — il sert au bureau à la restitution.
					</Note>
				</Section>
			</div>

			<aside className="space-y-4 lg:sticky lg:top-20">
				<Card>
					<CardHeader>
						<CardTitle className="text-base">À la publication</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2.5 text-sm">
							<li className="flex gap-2">
								<CheckCircle2 className="text-primary-green-text mt-0.5 h-4 w-4 shrink-0" />
								<span>Visible aussitôt, sans passer par la modération.</span>
							</li>
							<li className="flex gap-2">
								<Search className="text-primary-green-text mt-0.5 h-4 w-4 shrink-0" />
								<span>Le rapprochement se lance.</span>
							</li>
							<li className="flex gap-2">
								<CheckCircle2 className="text-primary-green-text mt-0.5 h-4 w-4 shrink-0" />
								<span>
									Badge « Équipe RetrouveCI » sur la carte et le détail.
								</span>
							</li>
							<li className="text-muted-foreground flex gap-2">
								<BellOff className="mt-0.5 h-4 w-4 shrink-0" />
								<span>Aucune notification au bureau.</span>
							</li>
						</ul>
						<p className="text-muted-foreground mt-4 text-xs">
							L’annonce appartient au compte de l’équipe, pas au vôtre : elle
							survit à votre départ.
						</p>
					</CardContent>
				</Card>

				<Button
					type="submit"
					className="w-full"
					disabled={fetcher.isSubmitting}
				>
					{fetcher.isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Publication…
						</>
					) : (
						'Publier maintenant'
					)}
				</Button>
			</aside>
		</form>
	)
}
