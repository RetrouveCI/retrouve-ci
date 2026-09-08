import { BANK_CARD_DIGITS, DOCUMENT_TYPES } from '@app/contracts/lost-items'
import type { DocumentType } from '@app/contracts/lost-items'

export interface DocumentGuideEntry {
	/**
	 * The State issues it, so a replacement is asked for administratively.
	 * Asserted against `DOCUMENT_FIELDS`, whose `issuer` is absent for these.
	 */
	stateIssued: boolean
	/** What a listing carries for this piece, and what it never carries. */
	listing: string
	/** The move that comes before publishing, when there is one. */
	first?: string
}

// ⚠️ No figure, no delay, no list of papers: nothing here can verify an Ivorian
// administrative procedure, and an invented one is worse than an omission. What
// is stated is what this platform does, which the contract holds.
export const DOCUMENT_GUIDE: Record<DocumentType, DocumentGuideEntry> = {
	national_id: {
		stateIssued: true,
		listing:
			"Le type de pièce et le nom du titulaire, tels qu'ils sont imprimés dessus. Le numéro est facultatif et sert à lever un doute au moment de la remise.",
	},
	passport: {
		stateIssued: true,
		listing:
			'Le type de pièce et le nom du titulaire. Le numéro reste facultatif, comme pour toute pièce.',
	},
	driver_licence: {
		stateIssued: true,
		listing:
			'Le type de pièce et le nom du titulaire. Un permis se retrouve souvent avec le reste du portefeuille, donc pensez à décrire aussi ce qui le contenait.',
	},
	bank_card: {
		stateIssued: false,
		first:
			"Faites opposition auprès de votre banque avant toute autre démarche : une carte perdue reste utilisable tant qu'elle n'est pas bloquée.",
		listing: `Le nom de la banque et seulement les ${BANK_CARD_DIGITS} derniers chiffres. Le numéro complet est refusé par le formulaire : il n'aide en rien à reconnaître la carte, et il n'a rien à faire sur une page publique.`,
	},
	insurance_card: {
		stateIssued: false,
		listing:
			"Le nom de l'assureur et le numéro de police. C'est l'assureur qui réédite la carte.",
	},
	student_card: {
		stateIssued: false,
		listing:
			"Le nom de l'établissement et le numéro d'étudiant. La réédition se demande à la scolarité.",
	},
	other: {
		stateIssued: false,
		listing:
			"L'administration ou l'organisme qui a délivré la pièce, et son numéro. Si le type ne figure pas dans la liste du formulaire, décrivez-le dans le champ libre.",
	},
}

/** The order the page walks them in: the contract's, so nothing is skipped. */
export const DOCUMENT_GUIDE_ORDER = DOCUMENT_TYPES
