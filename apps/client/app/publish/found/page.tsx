'use client'

import {
	Button,
	Label,
	Textarea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MatchingSuggestions } from '@/app/publish/components/matching-suggestions'
import { ImageUpload } from '@/app/publish/components/image-upload'
import { LocationDateSection } from '@/app/publish/components/location-date-section'
import { ContactSection } from '@/app/publish/components/contact-section'
import { FormProgress } from '@/app/publish/components/form-progress'
import { TipsPanel } from '@/app/publish/components/tips-panel'
import { usePublishForm } from '@/hooks/use-publish-form'
import { cn } from '@retrouve-ci/ui/utils'

const ACCENT = 'varprimary-green'

const objectTypes = [
	{ value: 'phone', label: 'Téléphone' },
	{ value: 'keys', label: 'Clés' },
	{ value: 'wallet', label: 'Portefeuille' },
	{ value: 'bag', label: 'Sac' },
	{ value: 'electronics', label: 'Électronique' },
	{ value: 'clothing', label: 'Vêtement' },
	{ value: 'jewelry', label: 'Bijoux' },
	{ value: 'documents', label: 'Documents' },
	{ value: 'other', label: 'Autre' },
]

const tips = [
	'Ajoutez une photo pour aider le propriétaire',
	"Décrivez l'état et les détails visibles",
	"Précisez où vous conservez l'objet",
	'Répondez rapidement aux messages',
]

const progressItems = (
	formData: ReturnType<typeof usePublishForm>['formData'],
) => [
	{ label: "Type d'objet", done: !!formData.objectType },
	{
		label: 'Description (20 car. min)',
		done: formData.description.length >= 20,
	},
	{ label: 'Lieu de la trouvaille', done: !!formData.ville },
	{ label: 'Votre nom', done: !!formData.name },
	{ label: 'WhatsApp', done: !!formData.whatsapp },
]

export default function PublierRetrouvePage() {
	const router = useRouter()
	const {
		formData,
		update,
		imagePreview,
		setImagePreview,
		handleImageChange,
		progress,
		isSubmitting,
		handleSubmit,
	} = usePublishForm(
		'Merci de votre bonne action. Le propriétaire pourra vous contacter.',
	)

	return (
		<>
			<Header />
			<main className="bg-muted/20 flex-1">
				<div className="container mx-auto px-4 py-8 md:py-12">
					<Link
						href="/publish"
						className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Retour
					</Link>

					<div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
						<div className="space-y-6">
							<div className="flex items-center gap-3 pb-2">
								<div className="bg-primary-green/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
									<CheckCircle className="text-primary-green h-5 w-5" />
								</div>
								<div>
									<h1 className="text-2xl font-bold">Objet retrouvé</h1>
									<p className="text-muted-foreground text-sm">
										Aidez le propriétaire à récupérer son bien.
									</p>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="bg-background space-y-5 rounded-2xl border p-6">
									<h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
										Informations sur l&apos;objet
									</h2>

									<div className="space-y-2">
										<Label htmlFor="objectType">
											Type d&apos;objet{' '}
											<span className="text-destructive">*</span>
										</Label>
										<Select
											value={formData.objectType}
											onValueChange={update('objectType')}
										>
											<SelectTrigger id="objectType" className="h-11">
												<SelectValue placeholder="Sélectionnez un type" />
											</SelectTrigger>
											<SelectContent>
												{objectTypes.map(t => (
													<SelectItem key={t.value} value={t.value}>
														{t.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">
											Description <span className="text-destructive">*</span>
										</Label>
										<Textarea
											id="description"
											placeholder="Couleur, marque, signes distinctifs, état de l'objet..."
											value={formData.description}
											onChange={e => update('description')(e.target.value)}
											className="min-h-27.5 resize-none"
										/>
										<p
											className={cn(
												'text-xs',
												formData.description.length >= 20
													? 'text-primary-green'
													: 'text-muted-foreground',
											)}
										>
											{formData.description.length >= 20
												? '✓ Suffisant'
												: `Minimum 20 caractères (${formData.description.length}/20)`}
										</p>
									</div>

									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Label>Photo</Label>
											<span className="border-primary-green/20 bg-primary-green/10 text-primary-green rounded-full border px-2 py-0.5 text-[10px] font-semibold">
												Recommandé
											</span>
										</div>
										<ImageUpload
											preview={imagePreview}
											onRemove={() => setImagePreview(null)}
											onChange={handleImageChange}
											variant="recommended"
											accentColor={ACCENT}
										/>
									</div>
								</div>

								<LocationDateSection
									ville={formData.ville}
									commune={formData.commune}
									date={formData.date}
									dateLabel="Date de la trouvaille"
									sectionTitle="Lieu & date de la trouvaille"
									onVilleChange={update('ville')}
									onCommuneChange={update('commune')}
									onDateChange={update('date')}
								/>

								<ContactSection
									name={formData.name}
									whatsapp={formData.whatsapp}
									onNameChange={update('name')}
									onWhatsappChange={update('whatsapp')}
									showPrivacyNote
								/>

								<div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
									>
										Annuler
									</Button>
									<Button
										type="submit"
										className="bg-primary-green hover:bg-primary-green-dark h-12 text-white sm:flex-1"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Publication...
											</>
										) : (
											"Publier l'annonce"
										)}
									</Button>
								</div>
							</form>
						</div>

						<div className="space-y-4 self-start lg:sticky lg:top-24">
							<FormProgress
								progress={progress}
								items={progressItems(formData)}
								accentColor={ACCENT}
							/>

							{formData.objectType && formData.ville ? (
								<MatchingSuggestions
									objectType={formData.objectType}
									ville={formData.ville}
									commune={formData.commune}
									formType="retrouve"
								/>
							) : (
								<TipsPanel
									tips={tips}
									accentColor={ACCENT}
									hint="Remplissez le type d'objet et la ville pour voir les correspondances."
								/>
							)}
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
