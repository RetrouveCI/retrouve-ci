import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { OG_IMAGE, pageMeta } from '../page-meta'

const nameOf = (tag: { name?: string; property?: string }) =>
	tag.name ?? tag.property

describe('pageMeta', () => {
	it('shares the 1200×630 image by default', () => {
		const tags = pageMeta({ title: 'Annonces' })

		expect(OG_IMAGE).toBe('/og-image.png')
		expect(tags).toContainEqual({ property: 'og:image', content: OG_IMAGE })
		expect(tags).toContainEqual({ name: 'twitter:image', content: OG_IMAGE })
	})

	it('lets a page share its own image instead', () => {
		const tags = pageMeta({ title: 'Une annonce', image: '/uploads/x.jpg' })

		expect(tags).toContainEqual({
			property: 'og:image',
			content: '/uploads/x.jpg',
		})
	})

	// Two tags on a page and the first wins, so this one must stay silent.
	it('leaves the chrome colour to the document', () => {
		const tags = pageMeta({ title: 'Compte' })

		expect(tags.map(nameOf)).not.toContain('theme-color')
	})

	it('says nothing about a description it was not given', () => {
		const named = pageMeta({ title: 'Compte' }).map(nameOf)

		expect(named).not.toContain('description')
		expect(named).not.toContain('og:description')
	})
})

describe('the shared image on disk', () => {
	it('is the ratio WhatsApp crops to', () => {
		const png = readFileSync(join(process.cwd(), 'public', OG_IMAGE.slice(1)))

		expect({
			width: png.readUInt32BE(16),
			height: png.readUInt32BE(20),
		}).toEqual({ width: 1200, height: 630 })
	})
})
