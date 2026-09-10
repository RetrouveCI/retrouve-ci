import { newPostSchema } from '../new-post.schema'

const VALID = {
	type: 'found',
	category: 'wallet',
	title: 'Portefeuille marron',
	description: 'Déposé au bureau, papiers à l’intérieur, bon état général.',
	ville: 'Abidjan',
	commune: '',
	eventDate: '2026-09-06',
	contactName: 'Équipe RetrouveCI',
	contactWhatsapp: '07 58 99 14 27',
	documentType: '',
	documentHolderName: '',
	documentNumber: '',
	documentIssuer: '',
	postedFor: '',
}

const issuesOn = (values: Record<string, unknown>) => {
	const result = newPostSchema.safeParse(values)
	return result.success ? [] : result.error.issues.map(issue => issue.path[0])
}

describe('newPostSchema', () => {
	it('accepts the form as a desk fills it in', () => {
		expect(newPostSchema.safeParse(VALID).success).toBe(true)
	})

	// A `Select` starts on '', which no closed enum accepts.
	it('reads an untouched piece type as absent', () => {
		expect(newPostSchema.parse(VALID).documentType).toBeUndefined()
	})

	it('names the category when none was chosen', () => {
		expect(issuesOn({ ...VALID, category: '' })).toContain('category')
	})

	it('refuses a local number that cannot be a Côte d’Ivoire line', () => {
		expect(issuesOn({ ...VALID, contactWhatsapp: '123' })).toContain(
			'contactWhatsapp',
		)
	})

	// The contract's own rules, not a copy: a piece still needs its holder.
	it('requires the holder once a piece type is chosen', () => {
		expect(issuesOn({ ...VALID, documentType: 'national_id' })).toContain(
			'documentHolderName',
		)
	})

	it('drops the description floor for a described piece', () => {
		expect(
			newPostSchema.safeParse({
				...VALID,
				category: 'documents',
				description: '',
				documentType: 'national_id',
				documentHolderName: 'Konan Aya',
			}).success,
		).toBe(true)
	})

	it('keeps the floor for any other object', () => {
		expect(issuesOn({ ...VALID, description: 'Trop court' })).toContain(
			'description',
		)
	})
})
