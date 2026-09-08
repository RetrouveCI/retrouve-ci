import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { pageMeta } from '@/shared/helpers/page-meta'
import {
	DOCUMENT_FIELDS,
	DOCUMENT_TYPE_LABELS,
} from '@/shared/constants/documents'
import { DOCUMENT_GUIDE, DOCUMENT_GUIDE_ORDER } from './document-guide.const'

export function meta() {
	return pageMeta({
		title: "Carte d'identité ou pièce perdue en Côte d'Ivoire",
		description:
			"Comment retrouver une carte nationale d'identité, un passeport, un permis ou une carte bancaire perdus en Côte d'Ivoire : publiez une annonce sans photo, avec le type de pièce et le nom du titulaire.",
	})
}

function GuideLink({ to, children }: { to: string; children: string }) {
	return (
		<Link
			to={to}
			className="text-primary-green-text inline-flex min-h-11 items-center gap-1.5 font-semibold"
		>
			{children}
			<ArrowRight className="h-4 w-4 shrink-0" />
		</Link>
	)
}

// The search the sponsor's screenshot showed, whose feature has existed since
// A7 and R35 with no page naming it. Every claim here is one the contract holds.
export default function DocumentGuidePage() {
	return (
		<main className="flex-1 px-4 py-8 lg:py-12">
			<div className="mx-auto w-full max-w-160 space-y-8">
				<header className="space-y-3">
					<h1 className="text-3xl leading-tight font-bold tracking-tight text-balance lg:text-4xl">
						Vous avez perdu votre carte d&apos;identité ou une autre pièce
					</h1>
					<p className="text-muted-foreground text-lg leading-relaxed">
						RetrouveCI publie les pièces perdues et retrouvées en Côte
						d&apos;Ivoire sans en montrer aucune photo&nbsp;: une annonce de
						pièce porte son type et le nom de son titulaire, ce qui suffit à la
						rapprocher d&apos;une pièce trouvée et à la vérifier à la remise.
					</p>
				</header>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Ce qu&apos;il faut faire, dans l&apos;ordre
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Une pièce officielle se déclare d&apos;abord auprès des autorités,
						puis se publie ici pour que la personne qui la trouve puisse vous
						joindre. Les deux démarches sont indépendantes&nbsp;: l&apos;annonce
						n&apos;attend pas la déclaration.
					</p>
					<div className="flex flex-col gap-1">
						<GuideLink to="/objet-perdu-cote-divoire">
							Les étapes de la déclaration
						</GuideLink>
						<GuideLink to="/publish/lost">
							Publier une annonce de perte
						</GuideLink>
						<GuideLink to="/posts">
							Voir les pièces déjà déclarées trouvées
						</GuideLink>
					</div>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Pièce par pièce, ce que porte l&apos;annonce
					</h2>
					<ul className="space-y-3">
						{DOCUMENT_GUIDE_ORDER.map(type => {
							const entry = DOCUMENT_GUIDE[type]

							return (
								<li
									key={type}
									className="border-border bg-card rounded-[14px] border p-5"
								>
									<h3 className="text-lg font-bold tracking-tight">
										{DOCUMENT_TYPE_LABELS[type]}
									</h3>
									{entry.first && (
										<p className="text-foreground mt-2 leading-relaxed font-semibold">
											{entry.first}
										</p>
									)}
									<p className="text-muted-foreground mt-2 leading-relaxed">
										{entry.listing}
									</p>
									<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
										{entry.stateIssued
											? "Pièce délivrée par l'État : sa réédition se demande auprès de l'administration, pas ici."
											: `Le formulaire vous demandera « ${DOCUMENT_FIELDS[type].issuer?.label} » : c'est cet organisme qui réédite la pièce.`}
									</p>
								</li>
							)
						})}
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Pourquoi aucune photo de pièce n&apos;est publiée
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						La photo d&apos;une carte livre d&apos;un coup le nom, le numéro et
						la date de naissance de son titulaire, sur une page que les moteurs
						de recherche indexent. Le formulaire refuse donc les photos sur une
						annonce de pièce, et la recherche de correspondance tourne sur le
						nom du titulaire&nbsp;: c&apos;est ce nom, et non une image, qui
						rapproche une pièce perdue d&apos;une pièce trouvée.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-bold tracking-tight">
						Vous avez trouvé une pièce d&apos;identité
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Déclarez-la comme trouvée avec son type et le nom qui y figure. Son
						titulaire la cherche peut-être déjà, et vous n&apos;avez pas à
						donner votre numéro pour le prévenir.
					</p>
					<GuideLink to="/publish/found">Déclarer une pièce trouvée</GuideLink>
				</section>
			</div>
		</main>
	)
}
