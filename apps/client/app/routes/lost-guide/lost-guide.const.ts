export interface GuideStep {
	title: string
	body: string
	/** Where the step is done, when it is done here. */
	to?: string
	action?: string
}

/**
 * ⚠️ **Step 1 is deliberately vague until reviewed.** Nothing here can verify
 * what a `certificat de perte` costs or which papers are asked for, and a page
 * stating an invented fee is worse than one that omits it. The rest is ours, so
 * it is stated plainly.
 */
export const GUIDE_STEPS: GuideStep[] = [
	{
		title: 'Déclarez la perte auprès des autorités',
		body: "Pour une pièce d'identité, un passeport ou un permis, la déclaration se fait dans un commissariat de police ou une brigade de gendarmerie. C'est ce document que les administrations et les banques vous demanderont ensuite. Renseignez-vous auprès du poste le plus proche : les pièces à présenter dépendent du document perdu.",
	},
	{
		title: 'Publiez une annonce sur RetrouveCI',
		body: "Décrivez ce que vous avez perdu, où et quand. Pour une pièce, le type et le nom du titulaire suffisent — aucune photo n'est publiée, jamais. Toute personne qui trouve l'objet peut alors vous joindre sans voir votre numéro.",
		to: '/publish/lost',
		action: 'Publier une annonce',
	},
	{
		title: 'Regardez ce que d’autres ont trouvé',
		body: "Beaucoup d'objets sont déjà déclarés trouvés par la personne qui les a ramassés. La liste est publique et se filtre par ville, par commune et par type d'objet.",
		to: '/posts',
		action: 'Parcourir les annonces',
	},
	{
		title: 'Protégez ce qu’il vous reste avec un sticker QR',
		body: 'Un sticker collé sur vos clés, votre sac ou votre ordinateur donne à qui les trouve un moyen de vous joindre en un scan, sans que votre numéro apparaisse nulle part.',
		to: '/stickers',
		action: 'Voir les stickers',
	},
]

/** The other half of the question, and the half no page addressed. */
export const FINDER_STEPS: GuideStep[] = [
	{
		title: 'Vous avez trouvé un objet',
		body: "Publiez-le comme objet trouvé : son propriétaire le cherche peut-être déjà. Vous n'avez pas à donner votre numéro pour cela.",
		to: '/publish/found',
		action: 'Déclarer un objet trouvé',
	},
	{
		title: 'Vous avez trouvé un objet portant un sticker',
		body: 'Scannez-le. Vous arriverez sur une page qui vous permet de prévenir son propriétaire directement, sans compte et sans voir son numéro.',
		to: '/scan',
		action: 'Scanner un sticker',
	},
]
