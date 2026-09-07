import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { OG_IMAGE, pageMeta } from '../page-meta'

const nameOf = (tag: { name?: string; property?: string }) =>
	tag.name ?? tag.property

describe('pageMeta', () => {
	// R48 moved them to `root`'s `Layout`: a relative `og:image` left every
	// WhatsApp and Facebook preview without a picture.
	it('emits no image tag at all', () => {
		const named = pageMeta({ title: 'Annonces' }).map(nameOf)

		expect(OG_IMAGE).toBe('/og-image.png')
		expect(named).not.toContain('og:image')
		expect(named).not.toContain('twitter:image')
	})

	it('says nothing about robots unless asked', () => {
		expect(pageMeta({ title: 'Annonces' }).map(nameOf)).not.toContain('robots')
	})

	// A crawl blocked by robots.txt is still indexed when linked elsewhere.
	it('keeps a page out of the index on request', () => {
		expect(pageMeta({ title: 'Sticker', noindex: true })).toContainEqual({
			name: 'robots',
			content: 'noindex, nofollow',
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
