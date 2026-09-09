import type { PublishDraft } from '../publish-draft'
import {
	clearPublishDraft,
	hasDraftContent,
	readPublishDraft,
	writePublishDraft,
} from '../publish-draft'

const STEP_COUNT = 3

let store: Map<string, string>

function storageOver(entries: Map<string, string>) {
	return {
		getItem: (key: string) => entries.get(key) ?? null,
		setItem: (key: string, value: string) => void entries.set(key, value),
		removeItem: (key: string) => void entries.delete(key),
		clear: () => entries.clear(),
		key: (index: number) => [...entries.keys()][index] ?? null,
		get length() {
			return entries.size
		},
	}
}

/** Replaces whatever the module wrote with a payload it never would have. */
function overwriteStored(raw: string) {
	writePublishDraft({ values: { title: 'seed' }, step: 1 })
	const [key] = [...store.keys()]
	store.set(key ?? '', raw)
}

const FULL: PublishDraft = {
	values: {
		title: 'Téléphone Tecno noir',
		objectType: 'phone',
		description: 'Coque bleue, écran fissuré en haut à droite.',
		ville: 'Abidjan',
		commune: 'Cocody',
		date: '2026-08-26',
		name: 'Konan',
		whatsapp: '0700000000',
	},
	step: 2,
}

beforeEach(() => {
	store = new Map()
	vi.stubGlobal('localStorage', storageOver(store))
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('the publish draft', () => {
	it('brings back every field and the step it was left on', () => {
		writePublishDraft(FULL)

		expect(readPublishDraft(STEP_COUNT)).toEqual(FULL)
	})

	it('brings back a piece of ID as it was left', () => {
		const piece: PublishDraft = {
			values: {
				...FULL.values,
				objectType: 'documents',
				documentType: 'driver_licence',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: '5811403-13-001570',
				documentIssuer: '',
			},
			step: 1,
		}

		writePublishDraft(piece)

		expect(readPublishDraft(STEP_COUNT)).toEqual(piece)
	})

	// The `Select` can only show a value the contract still carries, so a type
	// edited by hand must read as « nothing chosen » rather than reach it.
	it.each(['carte_de_bus', 42, null])(
		'drops a stored document type of %s',
		documentType => {
			overwriteStored(
				JSON.stringify({
					values: { title: 'CNI trouvée', documentType },
					step: 1,
				}),
			)

			expect(readPublishDraft(STEP_COUNT)?.values.documentType).toBeUndefined()
		},
	)

	it('reads as absent when nothing was ever typed', () => {
		expect(readPublishDraft(STEP_COUNT)).toBeNull()
	})

	it('is gone once discarded', () => {
		writePublishDraft(FULL)
		clearPublishDraft()

		expect(readPublishDraft(STEP_COUNT)).toBeNull()
	})

	// Everything below comes back from a store the user can edit by hand, and a
	// wrong shape reaching `useForm` is a crash on the first screen of the flow.
	it.each([
		['malformed JSON', '{ nope'],
		['a payload that is not an object', '"nope"'],
		['a payload with no values', '{"step":2}'],
		['values that are not an object', '{"values":[],"step":1}'],
		['values that are all empty', '{"values":{"title":"  "},"step":1}'],
	])('reads as absent for %s', (_label, raw) => {
		overwriteStored(raw)

		expect(readPublishDraft(STEP_COUNT)).toBeNull()
	})

	it('keeps only the fields it knows, and only when they are strings', () => {
		overwriteStored(
			JSON.stringify({
				values: { title: 'Sac noir', objectType: 42, secret: 'x' },
				step: 1,
			}),
		)

		expect(readPublishDraft(STEP_COUNT)).toEqual({
			values: { title: 'Sac noir' },
			step: 1,
		})
	})

	it.each([
		['a step past the last one', 9, 3],
		['a step below the first', 0, 1],
		['a step that is not a number', 'deux', 1],
		['a fractional step', 1.5, 1],
	])('falls back for %s', (_label, step, expected) => {
		overwriteStored(JSON.stringify({ values: { title: 'Sac' }, step }))

		expect(readPublishDraft(STEP_COUNT)?.step).toBe(expected)
	})

	// Private browsing and a full quota both throw on write; neither is a reason
	// to take the form down.
	it('says nothing when the store refuses to answer', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('denied')
			},
			setItem: () => {
				throw new Error('denied')
			},
			removeItem: () => {
				throw new Error('denied')
			},
		})

		expect(() => writePublishDraft(FULL)).not.toThrow()
		expect(() => clearPublishDraft()).not.toThrow()
		expect(readPublishDraft(STEP_COUNT)).toBeNull()
	})

	it.each([
		['an empty set', {}, false],
		['blank strings alone', { title: '', commune: '   ' }, false],
		['one typed field', { commune: 'Cocody' }, true],
	])('counts %s as content: %s', (_label, values, expected) => {
		expect(hasDraftContent(values)).toBe(expected)
	})

	// The contact name arrives prefilled from the account, so counting it would
	// announce « Brouillon enregistré » to someone who has written nothing.
	it.each([
		['left as it opened', 'Konan', false],
		['changed', 'Awa', true],
	])('counts a prefilled field %s as content: %s', (_label, name, expected) => {
		expect(hasDraftContent({ name }, { name: 'Konan' })).toBe(expected)
	})
})
