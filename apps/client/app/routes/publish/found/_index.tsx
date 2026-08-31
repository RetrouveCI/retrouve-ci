import { Link } from 'react-router'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { FormRootError } from '@app/ui/components/form'
import { LocationDateSection } from '../components/location-date-section'
import { ContactSection } from '../components/contact-section'
import { ObjectInfoSection } from '../components/object-info-section'
import { PublishPageHeader } from '../components/publish-page-header'
import { PublishSidebar } from '../components/publish-sidebar'
import { PublishFormActions } from '../components/publish-form-actions'
import { MIN_DESCRIPTION_LENGTH } from '@app/contracts/lost-items'
import { usePublishForm } from '../hooks/use-publish-form'
import { FOUND_TIPS } from '../publish.const'
import { publishLoader } from '../servers/publish.loader'
import { publishAction } from '../servers/publish.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

const ACCENT = 'var(--primary-green)'

export const loader = publishLoader

export const action = ({ request }: Route.ActionArgs) =>
	publishAction(request, 'found')

export function meta() {
	return pageMeta({
		title: 'Publier un objet retrouvé',
		description:
			"Décrivez l'objet que vous avez retrouvé pour aider son propriétaire à le récupérer.",
	})
}

export default function PublishFoundPage() {
	const { form, values, onSubmit, progress, isSubmitting } = usePublishForm()

	const progressItems = [
		{ label: 'Titre', done: !!values.title },
		{ label: "Type d'objet", done: !!values.objectType },
		{
			label: `Description (${MIN_DESCRIPTION_LENGTH} car. min)`,
			done: (values.description?.length ?? 0) >= MIN_DESCRIPTION_LENGTH,
		},
		{ label: 'Lieu de la trouvaille', done: !!values.ville },
		{ label: 'Date de découverte', done: !!values.date },
		{ label: 'Votre nom', done: !!values.name },
		{ label: 'WhatsApp', done: !!values.whatsapp },
	]

	return (
		<main className="bg-muted/20 flex-1">
			<div className="container mx-auto px-4 py-8 md:py-12">
				<Link
					to="/publish"
					className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
					Retour
				</Link>

				<div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
					<div className="space-y-6">
						<PublishPageHeader
							icon={CheckCircle}
							iconBgClass="bg-primary-green/10"
							iconColorClass="text-primary-green-text"
							title="Objet retrouvé"
							description="Aidez le propriétaire à récupérer son bien."
						/>

						<form onSubmit={onSubmit} noValidate className="space-y-5">
							<FormRootError message={form.formState.errors.root?.message} />

							<ObjectInfoSection
								step={1}
								control={form.control}
								accentColor={ACCENT}
								counterAccentClass="text-primary-green-text"
								descriptionPlaceholder="Couleur, marque, signes distinctifs, état de l'objet..."
								photoVariant="recommended"
								photoBadge="Recommandé"
								photoBadgeClassName="border-primary-green/20 bg-primary-green/10 text-primary-green-text"
							/>

							<LocationDateSection
								step={2}
								control={form.control}
								dateLabel="Date de la trouvaille"
								sectionTitle="Lieu & date de la trouvaille"
								accentColor={ACCENT}
							/>

							<ContactSection
								step={3}
								control={form.control}
								accentColor={ACCENT}
								showPrivacyNote
							/>

							<PublishFormActions
								isSubmitting={isSubmitting}
								submitClassName="bg-primary-green text-white hover:bg-primary-green-dark"
							/>
						</form>
					</div>

					<PublishSidebar
						progress={progress}
						items={progressItems}
						accentColor={ACCENT}
						objectType={values.objectType ?? ''}
						ville={values.ville ?? ''}
						formType="retrouve"
						tips={FOUND_TIPS}
						hint="Remplissez le type d'objet et la ville pour voir les correspondances."
					/>
				</div>
			</div>
		</main>
	)
}
