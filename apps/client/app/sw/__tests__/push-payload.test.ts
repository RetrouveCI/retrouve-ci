import { toPushNotice } from '../push-payload'

const payload = (data: Record<string, unknown>) => JSON.stringify(data)

describe('what a push shows', () => {
	it('reads the three fields the API sends', () => {
		expect(
			toPushNotice(
				payload({
					title: 'Correspondance trouvée',
					message: 'Une annonce correspond.',
					link: '/posts/abc',
				}),
			),
		).toEqual({
			title: 'Correspondance trouvée',
			body: 'Une annonce correspond.',
			link: '/posts/abc',
		})
	})

	/**
	 * ⚠️ `userVisibleOnly` is a promise to the browser: showing nothing would
	 * have Chrome post its own « site updated in background » notice, so an
	 * unreadable payload still gets a notice of ours.
	 */
	const unusable: [string | null, string][] = [
		['', 'empty'],
		[null, 'absent'],
		['not json', 'unparseable'],
		['{}', 'empty object'],
		[payload({ title: '   ' }), 'blank title'],
	]

	it.each(unusable)('still answers something showable for %s (%s)', raw => {
		const notice = toPushNotice(raw)

		expect(notice.title).toBe('RetrouveCI')
		expect(notice.body).not.toBe('')
	})

	// ⚠️ The link arrives over the wire: opening any origin from a tap would be
	// an open redirect with a notification for a UI.
	it.each([
		'https://evil.example/x',
		'//evil.example/x',
		'javascript:alert(1)',
		'',
	])('refuses %s as a destination', link => {
		expect(toPushNotice(payload({ link })).link).toBe('/notifications')
	})

	it('keeps an internal path', () => {
		expect(toPushNotice(payload({ link: '/account/posts' })).link).toBe(
			'/account/posts',
		)
	})

	it('falls back per field rather than all or nothing', () => {
		expect(toPushNotice(payload({ title: 'Titre' }))).toEqual({
			title: 'Titre',
			body: 'Vous avez une nouvelle notification.',
			link: '/notifications',
		})
	})
})
