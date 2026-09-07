/**
 * ⚠️ `<meta name="keywords">` is **not** a ranking signal: Google dropped it in
 * 2009 and Bing treats stuffing as spam. What ranks is the `<title>`, the
 * description and the pages themselves. Kept because it costs a line, never as
 * the place to win a search.
 *
 * One list, so adding a term never means opening `root.tsx`. The groups are for
 * reading only — the order carries no weight.
 */
export const SEO_KEYWORDS = [
	'objets perdus',
	'objets retrouvés',
	"Côte d'Ivoire",
	'abidjan',
	'RetrouveCI',
	'lost and found',
	'QR code',

	// Papers, what the related queries ask for most.
	'cni perdu',
	"carte d'identité perdue",
	"carte d'identité nationale perdue",
	"carte d'identité étrangère perdue",
	'passeport perdu',
	'passeport étranger perdu',
	'permis de conduire perdu',
	'permis de conduire international perdu',
	'documents perdus',
	'papiers perdus',
	'carte bancaire perdue',
	'carte de crédit perdue',

	'téléphone perdu',
	'clés perdues',
	'portefeuille perdu',
	'sac perdu',
	'bagage perdu',
	'ordinateur perdu',
	'lunettes perdues',
	'bijoux perdus',

	'vélo perdu',
	'moto perdue',
	'voiture perdue',

	// Animals: no category covers them.
	'animaux perdus',
	'chat perdu',
	'chien perdu',

	// The finder's side, half the listings. « trouvé » is what whoever picked an
	// object up types; « retrouvé » is the owner once it is back.
	'objet trouvé',
	'objets trouvés',
	"j'ai trouvé un objet",
	'déclarer un objet trouvé',
	'restituer un objet trouvé',
	'rendre un objet trouvé',

	"carte d'identité trouvée",
	'cni trouvée',
	'passeport trouvé',
	'permis de conduire trouvé',
	'papiers trouvés',
	'documents trouvés',
	'carte bancaire trouvée',

	'téléphone trouvé',
	'clés trouvées',
	'portefeuille trouvé',
	'sac trouvé',
	'bagage trouvé',
	'ordinateur trouvé',
	'bijoux trouvés',
	'chat trouvé',
	'chien trouvé',
] as const

export const SEO_KEYWORDS_CONTENT = SEO_KEYWORDS.join(', ')
