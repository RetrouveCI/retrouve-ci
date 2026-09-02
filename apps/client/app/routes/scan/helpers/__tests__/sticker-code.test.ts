import { describe, expect, it } from 'vitest'
import { parseStickerCode } from '../sticker-code'

describe('parseStickerCode', () => {
	it('reads the bare code a sticker prints under its QR', () => {
		expect(parseStickerCode('RCI-ABC123')).toEqual({
			ok: true,
			code: 'RCI-ABC123',
		})
	})

	it('reads the full URL the QR itself encodes', () => {
		expect(parseStickerCode('https://retrouve.ci/q/RCI-ABC123')).toEqual({
			ok: true,
			code: 'RCI-ABC123',
		})
	})

	it('accepts any origin, so a phone pointed at a laptop still scans', () => {
		expect(parseStickerCode('http://192.168.1.12:3000/q/RCI-ABC123')).toEqual({
			ok: true,
			code: 'RCI-ABC123',
		})
	})

	it('drops the query string and the fragment', () => {
		expect(
			parseStickerCode('https://retrouve.ci/q/RCI-ABC123?from=qr#top'),
		).toEqual({ ok: true, code: 'RCI-ABC123' })
	})

	it('normalises the case', () => {
		expect(parseStickerCode('rci-abc123')).toEqual({
			ok: true,
			code: 'RCI-ABC123',
		})
	})

	it('normalises a missing, doubled or misplaced hyphen', () => {
		for (const raw of ['RCIABC123', 'RCI--ABC123', 'RCI-ABC-123']) {
			expect(parseStickerCode(raw)).toEqual({ ok: true, code: 'RCI-ABC123' })
		}
	})

	it('normalises the spaces a hand-typed code carries', () => {
		expect(parseStickerCode('  rci abc 123 ')).toEqual({
			ok: true,
			code: 'RCI-ABC123',
		})
	})

	it('refuses a QR that is not a RetrouveCI sticker', () => {
		for (const raw of [
			'https://example.com/',
			'WIFI:S:cafe;T:WPA;P:secret;;',
			'tel:+2250700000000',
			'',
		]) {
			expect(parseStickerCode(raw)).toEqual({ ok: false, reason: 'foreign' })
		}
	})

	it('refuses a code of the wrong length', () => {
		for (const raw of ['RCI-ABC12', 'RCI-ABC1234']) {
			expect(parseStickerCode(raw)).toEqual({ ok: false, reason: 'foreign' })
		}
	})

	it('refuses one of our own URLs that is not a scan link', () => {
		expect(parseStickerCode('https://retrouve.ci/posts/RCI-ABC123')).toEqual({
			ok: false,
			reason: 'foreign',
		})
	})
})
