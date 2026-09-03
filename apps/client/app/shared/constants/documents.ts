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

interface DocumentFieldSpec {
	number: { label: string; placeholder: string }
	/** Absent when the piece is issued by the State, which names no institution. */
	issuer?: { label: string; placeholder: string }
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
		issuer: { label: 'Banque', placeholder: 'Ex : SGCI, Ecobank, NSIA Banque' },
	},
	insurance_card: {
		number: { label: 'Numéro de police', placeholder: 'Ex : POL-2026-88123' },
		issuer: { label: 'Assureur', placeholder: 'Ex : NSIA, Sunu, Allianz' },
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
