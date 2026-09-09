import { LOST_ITEM_CATEGORIES } from '@app/contracts/lost-items'
import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

const { requireServerSession, collectPhotoUrls, patchLostItemContent } =
	vi.hoisted(() => ({
		requireServerSession: vi.fn(),
		collectPhotoUrls: vi.fn(),
		patchLostItemContent: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('@/routes/publish/servers/upload.service', () => ({ collectPhotoUrls }))
vi.mock('../../../servers/account-posts.service', () => ({
	patchLostItemContent,
}))

const { editPostAction } = await import('../edit-post.action')

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
	return new Request('http://localhost:3000/account/posts/post-1', {
		method: 'POST',
		body,
	})
}

const redirectTo = (value: unknown) =>
	value instanceof Response ? value.headers.get('location') : null

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	collectPhotoUrls.mockReset().mockResolvedValue([])
	patchLostItemContent.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('editPostAction', () => {
	it('gates on the session, uploading nothing', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(editPostAction(requestFor(), 'post-1')).rejects.toBe(redirect)
		expect(collectPhotoUrls).not.toHaveBeenCalled()
		expect(patchLostItemContent).not.toHaveBeenCalled()
	})

	it('patches the listing named by the route', async () => {
		await editPostAction(requestFor(), 'post-1').catch(() => undefined)

		expect(patchLostItemContent).toHaveBeenCalledWith(
			'post-1',
			expect.any(Object),
			expect.any(Request),
		)
	})

	// `type` and `category` are set at publication; the contract strips an
	// attempt to rewrite them, and this action never sends them.
	it('sends no type or category', async () => {
		await editPostAction(requestFor(), 'post-1').catch(() => undefined)

		const payload = patchLostItemContent.mock.calls[0]?.[1]
		expect(payload).not.toHaveProperty('type')
		expect(payload).not.toHaveProperty('category')
	})

	it('translates the form field names the API does not know', async () => {
		await editPostAction(requestFor(), 'post-1').catch(() => undefined)

		expect(patchLostItemContent.mock.calls[0]?.[1]).toMatchObject({
			eventDate: '2026-08-01',
			contactName: 'Awa Traoré',
			contactWhatsapp: '0700000000',
		})
	})

	it('omits an empty commune', async () => {
		await editPostAction(requestFor({ ...VALID, commune: '' }), 'post-1').catch(
			() => undefined,
		)

		expect(patchLostItemContent.mock.calls[0]?.[1].commune).toBeUndefined()
	})

	// Unlike publishing, an edit always sends `photos`: an empty array is how a
	// poster removes the last one.
	it('sends an empty photo list rather than omitting it', async () => {
		await editPostAction(requestFor(), 'post-1').catch(() => undefined)

		expect(patchLostItemContent.mock.calls[0]?.[1].photos).toEqual([])
	})

	it('returns to the account listing on success', async () => {
		const thrown = await editPostAction(requestFor(), 'post-1').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/account/posts')
	})

	it.each([
		['title', { title: 'ab' }],
		['description', { description: 'trop court' }],
		['ville', { ville: '' }],
		['date', { date: '2026-02-31' }],
		['whatsapp', { whatsapp: '123' }],
	])('refuses an invalid %s without patching', async (field, override) => {
		const result = await editPostAction(
			requestFor({ ...VALID, ...override }),
			'post-1',
		)

		expect(result.success).toBe(false)
		expect(errorsOf(result)?.[field]).toBeDefined()
		expect(patchLostItemContent).not.toHaveBeenCalled()
	})

	const PIECE = {
		...VALID,
		objectType: 'documents',
		description: '',
		documentType: 'driver_licence',
		documentHolderName: 'KOUASSI Jean',
		documentNumber: '5811403-13-001570',
		documentIssuer: '',
	}

	it('patches the four document fields', async () => {
		await editPostAction(requestFor(PIECE), 'post-1').catch(() => undefined)

		expect(patchLostItemContent).toHaveBeenCalledWith(
			'post-1',
			expect.objectContaining({
				documentType: 'driver_licence',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: '5811403-13-001570',
				documentIssuer: undefined,
			}),
			expect.any(Request),
		)
	})

	// The rule holds on the way back too: a listing that carried photos before
	// it declared a piece has them cleared rather than kept.
	it('clears the photos of a piece of ID', async () => {
		collectPhotoUrls.mockResolvedValue(['https://cdn/cni.jpg'])

		await editPostAction(requestFor(PIECE), 'post-1').catch(() => undefined)

		expect(collectPhotoUrls).not.toHaveBeenCalled()
		expect(patchLostItemContent.mock.calls[0]?.[1].photos).toEqual([])
	})

	it('does not patch when a photo upload fails', async () => {
		collectPhotoUrls.mockRejectedValue(new ApiError(413, 'Image trop lourde'))

		const result = await editPostAction(requestFor(), 'post-1')

		expect(result).toMatchObject({ success: false })
		expect(patchLostItemContent).not.toHaveBeenCalled()
	})

	it('redirects when the API answers 401', async () => {
		patchLostItemContent.mockRejectedValue(new ApiError(401, 'Non autorisé'))

		const thrown = await editPostAction(requestFor(), 'post-1').catch(
			(error: unknown) => error,
		)

		expect(redirectTo(thrown)).toBe('/login')
	})
})
