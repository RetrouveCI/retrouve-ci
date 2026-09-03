import { LOST_ITEM_CATEGORIES } from '@app/contracts/lost-items'
import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

const { getServerSession, createLostItem, collectPhotoUrls } = vi.hoisted(
	() => ({
		getServerSession: vi.fn(),
		createLostItem: vi.fn(),
		collectPhotoUrls: vi.fn(),
	}),
)

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../publish.service', () => ({ createLostItem }))
vi.mock('../upload.service', () => ({ collectPhotoUrls }))

const { publishAction } = await import('../publish.action')

const VALID = {
	title: 'Sac à dos noir',
	objectType: LOST_ITEM_CATEGORIES[3],
	description:
		'Sac à dos noir de marque, perdu près du marché de Cocody hier soir.',
	ville: 'Abidjan',
	commune: 'Cocody',
	date: '2026-08-01',
	name: 'Awa Traoré',
	whatsapp: '0700000000',
}

function requestFor(fields: Record<string, string> = VALID) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/publish/lost', {
		method: 'POST',
		body,
	})
}

const redirectTo = (value: unknown) =>
	value instanceof Response ? value.headers.get('location') : null

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	createLostItem.mockReset().mockResolvedValue({ id: 'post-1' })
	collectPhotoUrls.mockReset().mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('publishAction', () => {
	it('sends an anonymous visitor to the login page, uploading nothing', async () => {
		getServerSession.mockResolvedValue(null)

		const thrown = await publishAction(requestFor(), 'lost').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/login')
		expect(collectPhotoUrls).not.toHaveBeenCalled()
		expect(createLostItem).not.toHaveBeenCalled()
	})

	// The success path is a redirect, so it leaves through the throw channel.
	// A new listing is `pending`, so its public page would 404 on the poster.
	it('redirects to the listings of the person who wrote it', async () => {
		const thrown = await publishAction(requestFor(), 'lost').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/account/posts')
	})

	it('publishes under the type the route chose, not a form field', async () => {
		await publishAction(requestFor({ ...VALID, type: 'found' }), 'lost').catch(
			() => undefined,
		)

		expect(createLostItem).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'lost' }),
			expect.any(Request),
		)
	})

	it('translates the form field names the API does not know', async () => {
		await publishAction(requestFor(), 'found').catch(() => undefined)

		expect(createLostItem).toHaveBeenCalledWith(
			expect.objectContaining({
				category: LOST_ITEM_CATEGORIES[3],
				eventDate: '2026-08-01',
				contactName: 'Awa Traoré',
				contactWhatsapp: '0700000000',
			}),
			expect.any(Request),
		)
	})

	// An empty commune must not reach the API as `''`.
	it('omits an empty commune', async () => {
		await publishAction(requestFor({ ...VALID, commune: '' }), 'lost').catch(
			() => undefined,
		)

		expect(createLostItem.mock.calls[0]?.[0].commune).toBeUndefined()
	})

	it('omits photos when none were kept or uploaded', async () => {
		await publishAction(requestFor(), 'lost').catch(() => undefined)

		expect(createLostItem.mock.calls[0]?.[0].photos).toBeUndefined()
	})

	it('sends the photo urls the upload step resolved', async () => {
		collectPhotoUrls.mockResolvedValue(['https://cdn/a.jpg'])

		await publishAction(requestFor(), 'lost').catch(() => undefined)

		expect(createLostItem.mock.calls[0]?.[0].photos).toEqual([
			'https://cdn/a.jpg',
		])
	})

	it.each([
		['title', { title: 'ab' }],
		['objectType', { objectType: '' }],
		['objectType', { objectType: 'nawak' }],
		['description', { description: 'trop court' }],
		['ville', { ville: '' }],
		['date', { date: '2026-02-31' }],
		['name', { name: 'A' }],
		['whatsapp', { whatsapp: '123' }],
	])('refuses an invalid %s without publishing', async (field, override) => {
		const result = await publishAction(
			requestFor({ ...VALID, ...override }),
			'lost',
		)

		expect(result.success).toBe(false)
		expect(errorsOf(result)?.[field]).toBeDefined()
		expect(createLostItem).not.toHaveBeenCalled()
		expect(collectPhotoUrls).not.toHaveBeenCalled()
	})

	// A piece of ID is described by its type and its holder, so the API has to
	// receive them under the names the contract uses.
	it('forwards the four document fields', async () => {
		await publishAction(
			requestFor({
				...VALID,
				objectType: 'documents',
				description: '',
				documentType: 'insurance_card',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: 'POL-2026-88123',
				documentIssuer: 'NSIA',
			}),
			'found',
		).catch(() => undefined)

		expect(createLostItem).toHaveBeenCalledWith(
			expect.objectContaining({
				documentType: 'insurance_card',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: 'POL-2026-88123',
				documentIssuer: 'NSIA',
			}),
			expect.any(Request),
		)
	})

	it('leaves the four fields absent when no piece was declared', async () => {
		await publishAction(requestFor(), 'lost').catch(() => undefined)

		const body = createLostItem.mock.calls[0]?.[0]

		expect(body.documentType).toBeUndefined()
		expect(body.documentHolderName).toBeUndefined()
		expect(body.documentNumber).toBeUndefined()
		expect(body.documentIssuer).toBeUndefined()
	})

	// A photo of a piece hands over the name, the number and the date of birth
	// at once — so nothing is uploaded, whatever the submitted form carried.
	it('uploads no photo for a piece of ID', async () => {
		collectPhotoUrls.mockResolvedValue(['https://cdn/cni.jpg'])

		await publishAction(
			requestFor({
				...VALID,
				objectType: 'documents',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
			}),
			'found',
		).catch(() => undefined)

		expect(collectPhotoUrls).not.toHaveBeenCalled()
		expect(createLostItem.mock.calls[0]?.[0].photos).toBeUndefined()
	})

	it('refuses a piece whose holder is not named', async () => {
		const result = await publishAction(
			requestFor({
				...VALID,
				objectType: 'documents',
				documentType: 'national_id',
			}),
			'found',
		)

		expect(result.success).toBe(false)
		expect(errorsOf(result)?.documentHolderName).toBeDefined()
		expect(createLostItem).not.toHaveBeenCalled()
	})

	it('reports an API refusal as a root error', async () => {
		createLostItem.mockRejectedValue(new ApiError(400, 'Annonce refusée'))

		const result = await publishAction(requestFor(), 'lost')

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Annonce refusée' } },
		})
	})

	// A session that expired between the page load and the submit.
	it('redirects when the API answers 401', async () => {
		createLostItem.mockRejectedValue(new ApiError(401, 'Non autorisé'))

		const thrown = await publishAction(requestFor(), 'lost').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/login')
	})

	// A failed upload must not leave a listing with missing photos behind.
	it('does not publish when a photo upload fails', async () => {
		collectPhotoUrls.mockRejectedValue(new ApiError(413, 'Image trop lourde'))

		const result = await publishAction(requestFor(), 'lost')

		expect(result).toMatchObject({ success: false })
		expect(createLostItem).not.toHaveBeenCalled()
	})
})
