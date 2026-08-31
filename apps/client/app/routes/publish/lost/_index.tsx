import { Link } from 'react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { FormRootError } from '@app/ui/components/form'
import { LocationDateSection } from '../components/location-date-section'
import { ContactSection } from '../components/contact-section'
import { ObjectInfoSection } from '../components/object-info-section'
import { PublishPageHeader } from '../components/publish-page-header'
import { PublishSidebar } from '../components/publish-sidebar'
import { PublishFormActions } from '../components/publish-form-actions'
import { MIN_DESCRIPTION_LENGTH } from '@app/contracts/lost-items'
import { usePublishForm } from '../hooks/use-publish-form'
import { LOST_TIPS } from '../publish.const'
import { publishLoader } from '../servers/publish.loader'
import { publishAction } from '../servers/publish.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

const ACCENT = 'var(--accent-orange)'

export const loader = publishLoader

export const action = ({ request }: Route.ActionArgs) =>
	publishAction(request, 'lost')

export function meta() {
	return pageMeta({
		title: 'Publier un objet perdu',
		description:
			"Décrivez l'objet que vous avez perdu pour que quelqu'un puisse vous aider.",
	})
}

export default function PublishLostPage() {
	const { form, values, onSubmit, progress, isSubmitting } = usePublishForm()

	const progressItems = [
		{ label: 'Titre', done: !!values.title },
		{ label: "Type d'objet", done: !!values.objectType },
		{
			label: `Description (${MIN_DESCRIPTION_LENGTH} car. min)`,
			done: (values.description?.length ?? 0) >= MIN_DESCRIPTION_LENGTH,
		},
		{ label: 'Lieu de perte', done: !!values.ville },
		{ label: 'Date de perte', done: !!values.date },
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
							icon={AlertCircle}
							iconBgClass="bg-accent-orange/10"
							iconColorClass="text-accent-orange-text"
							title="Objet perdu"
							description="Décrivez votre objet pour que quelqu'un puisse vous aider."
						/>

						<form onSubmit={onSubmit} noValidate className="space-y-5">
							<FormRootError message={form.formState.errors.root?.message} />

							<ObjectInfoSection
								step={1}
								control={form.control}
								accentColor={ACCENT}
								counterAccentClass="text-accent-orange-text"
								descriptionPlaceholder="Couleur, marque, signes distinctifs, contenu..."
								photoVariant="optional"
							/>

							<LocationDateSection
								step={2}
								control={form.control}
								dateLabel="Date de perte"
								sectionTitle="Lieu & date de perte"
								accentColor={ACCENT}
							/>

							<ContactSection
								step={3}
								control={form.control}
								accentColor={ACCENT}
							/>

							<PublishFormActions
								isSubmitting={isSubmitting}
								submitClassName="bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark"
							/>
						</form>
					</div>

					<PublishSidebar
						progress={progress}
						items={progressItems}
						accentColor={ACCENT}
						objectType={values.objectType ?? ''}
						ville={values.ville ?? ''}
						formType="perdu"
						tips={LOST_TIPS}
						hint="Remplissez le type d'objet et la ville pour voir les correspondances."
					/>
				</div>
			</div>
		</main>
	)
}
