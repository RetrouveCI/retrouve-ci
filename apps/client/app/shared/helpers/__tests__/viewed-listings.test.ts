import {
	readViewedListings,
	rememberViewedListing,
	type ViewedListing,
} from '../viewed-listings'

const KEY = 'retrouveci.viewed-listings.v1'

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

const listing = (id: string): ViewedListing => ({
	id,
	title: `Annonce ${id}`,
	location: 'Cocody, Abidjan',
})

beforeEach(() => {
	store = new Map()
	vi.stubGlobal('localStorage', storageOver(store))
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('the index of listings already read', () => {
	it('reads nothing on a device that has read nothing', () => {
		expect(readViewedListings()).toEqual([])
	})

	it('brings back what was written', () => {
		rememberViewedListing(listing('a'))

		expect(readViewedListings()).toEqual([listing('a')])
	})

	it('puts the most recent first', () => {
		rememberViewedListing(listing('a'))
		rememberViewedListing(listing('b'))

		expect(readViewedListings().map(entry => entry.id)).toEqual(['b', 'a'])
	})

	it('holds one entry per listing, moved back to the front', () => {
		rememberViewedListing(listing('a'))
		rememberViewedListing(listing('b'))
		rememberViewedListing(listing('a'))

		expect(readViewedListings().map(entry => entry.id)).toEqual(['a', 'b'])
	})

	it('stops at twelve, dropping the oldest', () => {
		for (let i = 0; i < 15; i += 1) rememberViewedListing(listing(`id-${i}`))

		const ids = readViewedListings().map(entry => entry.id)

		expect(ids).toHaveLength(12)
		expect(ids[0]).toBe('id-14')
		expect(ids).not.toContain('id-0')
	})

	it('takes a listing with no place, which the API allows', () => {
		rememberViewedListing({ id: 'a', title: 'Sans lieu', location: '' })

		expect(readViewedListings()).toEqual([
			{ id: 'a', title: 'Sans lieu', location: '' },
		])
	})

	it.each([
		['not JSON at all', 'not json'],
		['an object where an array belongs', '{"id":"a"}'],
		['a null', 'null'],
	])('reads %s as an empty index', (_name, raw) => {
		store.set(KEY, raw)

		expect(readViewedListings()).toEqual([])
	})

	it('drops the entries an older build wrote wrong, keeping the rest', () => {
		store.set(
			KEY,
			JSON.stringify([
				{ id: 'a', title: 'Bonne', location: 'Plateau' },
				{ id: '', title: 'Sans id', location: '' },
				{ id: 'c', title: 42, location: '' },
				null,
				{ id: 'd', title: 'Sans lieu' },
			]),
		)

		expect(readViewedListings()).toEqual([
			{ id: 'a', title: 'Bonne', location: 'Plateau' },
			{ id: 'd', title: 'Sans lieu', location: '' },
		])
	})

	it('reads nothing when the store refuses to be read', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('denied')
			},
		})

		expect(readViewedListings()).toEqual([])
	})

	it('says nothing when the store refuses to be written', () => {
		vi.stubGlobal('localStorage', {
			getItem: () => null,
			setItem: () => {
				throw new Error('full')
			},
		})

		expect(() => rememberViewedListing(listing('a'))).not.toThrow()
	})
})
