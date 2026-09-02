import { Link } from 'react-router'
import { Controller } from 'react-hook-form'
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	ArrowLeft,
	Loader2,
	Package,
} from 'lucide-react'
import { Button, FieldError, Input, Textarea } from '@app/ui/components'
import { FormRootError, InputLabel } from '@app/ui/components/form'
import { cn } from '@app/ui/utils'
import { SectionHeader } from '@/routes/publish/components/section-header'
import { LocationDateSection } from '@/routes/publish/components/location-date-section'
import { ContactSection } from '@/routes/publish/components/contact-section'
import { PublishPageHeader } from '@/routes/publish/components/publish-page-header'
import { PhotosUpload } from '@/routes/publish/components/photos-upload'
import { usePublishForm } from '@/routes/publish/hooks/use-publish-form'
import { MIN_DESCRIPTION_LENGTH } from '@app/contracts/lost-items'
import type { ModerationStatus } from '@/shared/types/lost-item'
import { toLocalDigits } from '@/shared/utils/phone'
import { OBJECT_TYPES } from '@/routes/publish/publish.const'
import { editPostLoader } from './servers/edit-post.loader'
import { editPostAction } from './servers/edit-post.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export const loader = ({ request, params }: Route.LoaderArgs) =>
	editPostLoader(request, params.id)

export const action = ({ request, params }: Route.ActionArgs) =>
	editPostAction(request, params.id)

export function meta() {
	return pageMeta({
		title: "Modifier l'annonce",
		description: 'Mettez à jour les informations de votre annonce.',
	})
}

/**
 * What editing actually does, per moderation state. The artboard promised a
 * return to validation; the API resets no moderation status, and a listing sent
 * back to `pending` would drop off the public list altogether — so the screen
 * says what happens instead of what was drawn.
 */
const EDIT_NOTICES: Record<ModerationStatus, string> = {
	published:
		'Votre annonce est en ligne : vos corrections seront visibles immédiatement, sans repasser par la validation.',
	pending:
		'Votre annonce attend sa validation : vos corrections seront prises en compte avant sa mise en ligne.',
	hidden:
		'Votre annonce a été masquée par la modération. La corriger ne la remet pas en ligne.',
}

export default function EditPostPage({ loaderData }: Route.ComponentProps) {
	const { item } = loaderData
	const isLost = item.type === 'lost'
	const accentColor = isLost ? 'var(--accent-orange)' : 'var(--primary-green)'
	const categoryLabel =
		OBJECT_TYPES.find(type => type.value === item.category)?.label ??
		item.category

	const { form, onSubmit, isSubmitting } = usePublishForm({
		title: item.title,
		objectType: item.category,
		description: item.description,
		ville: item.ville,
		commune: item.commune ?? '',
		date: item.eventDate.slice(0, 10),
		name: item.contactName,
		whatsapp: toLocalDigits(item.contactWhatsapp),
	})

	return (
		<main className="bg-muted/20 flex-1">
			<div className="container mx-auto px-4 py-8 md:py-12">
				<Link
					to="/account/posts"
					className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Mes annonces
				</Link>

				<div className="mx-auto max-w-2xl space-y-6">
					<PublishPageHeader
						icon={isLost ? AlertCircle : CheckCircle}
						iconBgClass={isLost ? 'bg-accent-orange/10' : 'bg-primary-green/10'}
						iconColorClass={
							isLost ? 'text-accent-orange-text' : 'text-primary-green-text'
						}
						title="Modifier l'annonce"
						description="Mettez à jour les informations de votre annonce."
					/>

					<div
						role="status"
						className="flex gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-50 p-4 text-yellow-900 dark:border-yellow-500/25 dark:bg-yellow-950/40 dark:text-yellow-100"
					>
						<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
						<p className="text-sm">{EDIT_NOTICES[item.moderationStatus]}</p>
					</div>

					<form onSubmit={onSubmit} noValidate className="space-y-5">
						<div className="bg-background space-y-5 rounded-2xl border p-6">
							<SectionHeader
								icon={Package}
								title="Informations sur l'objet"
								accentColor={accentColor}
							/>

							<Controller
								control={form.control}
								name="title"
								render={({ field, fieldState }) => (
									<div className="space-y-2">
										<InputLabel htmlFor={field.name} required>
											Titre
										</InputLabel>
										<Input
											{...field}
											id={field.name}
											value={field.value ?? ''}
											placeholder="Ex : iPhone 14 Pro noir"
											className="h-11"
											aria-invalid={fieldState.invalid || undefined}
										/>
										{fieldState.error && (
											<FieldError
												errors={[fieldState.error]}
												className="text-xs"
											/>
										)}
									</div>
								)}
							/>

							<div className="space-y-2">
								<InputLabel>Type d&apos;objet</InputLabel>
								<div className="bg-muted/50 text-muted-foreground flex h-11 items-center rounded-md border px-3 text-sm">
									{categoryLabel}
								</div>
							</div>

							<Controller
								control={form.control}
								name="description"
								render={({ field, fieldState }) => {
									const length = field.value?.length ?? 0
									const isLongEnough = length >= MIN_DESCRIPTION_LENGTH

									return (
										<div className="space-y-2">
											<InputLabel htmlFor={field.name} required>
												Description
											</InputLabel>
											<Textarea
												{...field}
												id={field.name}
												value={field.value ?? ''}
												placeholder={
													isLost
														? 'Couleur, marque, signes distinctifs, contenu...'
														: "Couleur, marque, signes distinctifs, état de l'objet..."
												}
												className="min-h-27.5 resize-none"
												aria-invalid={fieldState.invalid || undefined}
											/>
											<p
												className={cn(
													'text-xs',
													isLongEnough
														? isLost
															? 'text-accent-orange-text'
															: 'text-primary-green-text'
														: 'text-muted-foreground',
												)}
											>
												{isLongEnough
													? '✓ Suffisant'
													: `Minimum ${MIN_DESCRIPTION_LENGTH} caractères (${length}/${MIN_DESCRIPTION_LENGTH})`}
											</p>
											{fieldState.error && (
												<FieldError
													errors={[fieldState.error]}
													className="text-xs"
												/>
											)}
										</div>
									)
								}}
							/>

							<div className="space-y-2">
								<InputLabel>
									Photos{' '}
									{isLost ? (
										<span className="text-muted-foreground text-xs font-normal">
											(optionnel)
										</span>
									) : (
										<span className="border-primary-green/20 bg-primary-green/10 text-primary-green-text ml-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
											Recommandé
										</span>
									)}
								</InputLabel>
								<PhotosUpload
									initialPhotos={item.photos}
									variant={isLost ? 'optional' : 'recommended'}
									accentColor={accentColor}
								/>
							</div>
						</div>

						<LocationDateSection
							control={form.control}
							dateLabel={isLost ? 'Date de perte' : 'Date de la trouvaille'}
							sectionTitle={
								isLost ? 'Lieu & date de perte' : 'Lieu & date de la trouvaille'
							}
							accentColor={accentColor}
						/>

						<ContactSection
							control={form.control}
							accentColor={accentColor}
							showPrivacyNote={!isLost}
						/>

						<FormRootError message={form.formState.errors.root?.message} />

						<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
							<Button type="button" variant="outline" asChild>
								<Link to="/account/posts">Annuler</Link>
							</Button>
							<Button
								type="submit"
								className={cn(
									'h-12 sm:flex-1',
									isLost
										? 'bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark'
										: 'bg-primary-green hover:bg-primary-green-dark text-white',
								)}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Enregistrement...
									</>
								) : (
									'Enregistrer les modifications'
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</main>
	)
}
