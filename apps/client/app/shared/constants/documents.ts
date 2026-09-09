import {
	BANK_CARD_DIGITS,
	DOCUMENT_TYPES,
	type DocumentType,
} from '@app/contracts/lost-items'

/**
 * The contract owns the types; this app owns their labels and the fields each
 * asks for. Keying by `DocumentType` turns a type added to the contract into a
 * compilation error rather than a blank label.
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
	national_id: "Carte nationale d'identité",
	driver_licence: 'Permis de conduire',
	bank_card: 'Carte bancaire',
	insurance_card: "Carte d'assurance",
	passport: 'Passeport',
	student_card: 'Carte étudiante',
	other: 'Autre pièce',
}

export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map(value => ({
	value,
	label: DOCUMENT_TYPE_LABELS[value],
}))

/**
 * Neither list can be complete — banks rebrand and merge — so both are a
 * shortcut and never a closed set: « Autre » falls back to free text.
 */
export const CI_BANKS = [
	'Access Bank',
	'Afriland First Bank',
	'Banque Atlantique',
	'Banque Populaire',
	'BGFIBank',
	'BICICI',
	'BNI',
	'BOA (Bank of Africa)',
	'Bridge Bank',
	'BSIC',
	'Coris Bank',
	'Ecobank',
	'GTBank',
	'Mansa Bank',
	'NSIA Banque',
	'Orabank',
	'SIB',
	'Société Générale',
	'UBA',
	'Versus Bank',
]

export const CI_INSURERS = [
	'Activa Assurances',
	'Allianz',
	'Amsa Assurances',
	'Atlantique Assurances',
	'AXA',
	'Belife Insurance',
	'CNAM / CMU',
	'Loyale Assurances',
	'MUGEFCI',
	'NSIA Assurances',
	'Prudential Beneficial',
	'Sanlam',
	'SIDAM',
	'Sunu Assurances',
	'Wafa Assurance',
]

export interface DocumentIssuerSpec {
	label: string
	placeholder: string
	/** A shortcut list; absent when the field can only be free text. */
	options?: readonly string[]
}

interface DocumentFieldSpec {
	number: { label: string; placeholder: string }
	/** Absent when the piece is issued by the State, which names no institution. */
	issuer?: DocumentIssuerSpec
}

export const DOCUMENT_FIELDS: Record<DocumentType, DocumentFieldSpec> = {
	national_id: {
		number: { label: 'Numéro de la carte', placeholder: 'Ex : CI0012345678' },
	},
	driver_licence: {
		number: {
			label: 'Numéro du permis',
			placeholder: 'Ex : 5811403-13-001570',
		},
	},
	bank_card: {
		number: {
			label: `${BANK_CARD_DIGITS} derniers chiffres`,
			placeholder: 'Ex : 4321',
		},
		issuer: {
			label: 'Banque',
			placeholder: 'Le nom de la banque',
			options: CI_BANKS,
		},
	},
	insurance_card: {
		number: { label: 'Numéro de police', placeholder: 'Ex : POL-2026-88123' },
		issuer: {
			label: 'Assureur',
			placeholder: "Le nom de l'assureur",
			options: CI_INSURERS,
		},
	},
	passport: {
		number: { label: 'Numéro du passeport', placeholder: 'Ex : 21AB45678' },
	},
	student_card: {
		number: { label: "Numéro d'étudiant", placeholder: 'Ex : 20261234' },
		issuer: {
			label: 'Établissement',
			placeholder: 'Ex : Université Félix Houphouët-Boigny',
		},
	},
	other: {
		number: {
			label: 'Numéro de la pièce',
			placeholder: "Tel qu'il est imprimé",
		},
		issuer: {
			label: 'Émetteur',
			placeholder: "L'administration qui l'a délivrée",
		},
	},
}
