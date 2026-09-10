import type { ActionResult } from '@/shared/types/action'

const { requireAdminSession, createOfficialPost, collectPhotoUrls } =
	vi.hoisted(() => ({
		requireAdminSession: vi.fn(),
		createOfficialPost: vi.fn(),
		collectPhotoUrls: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/posts.service', () => ({ createOfficialPost }))
vi.mock('../upload.service', () => ({ collectPhotoUrls }))

const { newPostAction } = await import('../new-post.action')
const { ApiError } = await import('@/shared/utils/api-fetch')

const FIELDS = {
	type: 'found',
	category: 'wallet',
	title: 'Portefeuille marron',
	description: 'Déposé au bureau, papiers à l’intérieur, bon état général.',
	ville: 'Abidjan',
	commune: '',
	eventDate: '2026-09-06',
	contactName: 'Équipe RetrouveCI',
	contactWhatsapp: '0758991427',
	documentType: '',
	documentHolderName: '',
	documentNumber: '',
	documentIssuer: '',
	postedFor: '',
}

const requestFor = (fields: Record<string, string>) => {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.set(name, value)
	return new Request('http://localhost:3001/posts/new', {
		method: 'POST',
		body,
	})
}

const rootOf = (result: ActionResult<unknown>) =>
	result.success ? undefined : result.errors?.root?.message

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	createOfficialPost.mockReset().mockResolvedValue({ id: 'post-1' })
	collectPhotoUrls.mockReset().mockResolvedValue([])
})

describe('newPostAction', () => {
	it('gates on the admin session before anything else', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			newPostAction({ request: requestFor(FIELDS) }),
		).rejects.toBeInstanceOf(Response)
		expect(createOfficialPost).not.toHaveBeenCalled()
	})

	it('lands a refusal on its field without calling the API', async () => {
		const result = await newPostAction({
			request: requestFor({ ...FIELDS, title: 'ab' }),
		})

		expect(result.success).toBe(false)
		expect(result.success ? undefined : result.errors?.title).toBeDefined()
		expect(createOfficialPost).not.toHaveBeenCalled()
	})

	// A field left alone posts '', and the API must read it as absent.
	it('sends untouched optional fields as absent', async () => {
		await newPostAction({ request: requestFor(FIELDS) })

		const [body] = createOfficialPost.mock.calls[0]
		expect(body).toMatchObject({
			commune: undefined,
			documentType: undefined,
			documentHolderName: undefined,
			postedFor: undefined,
			photos: undefined,
		})
	})

	it('forwards who the team published for', async () => {
		await newPostAction({
			request: requestFor({ ...FIELDS, postedFor: 'Koffi Yao' }),
		})

		expect(createOfficialPost.mock.calls[0][0].postedFor).toBe('Koffi Yao')
	})

	it('attaches the uploaded photos', async () => {
		collectPhotoUrls.mockResolvedValue(['https://cdn/a.jpg'])

		await newPostAction({ request: requestFor(FIELDS) })

		expect(createOfficialPost.mock.calls[0][0].photos).toEqual([
			'https://cdn/a.jpg',
		])
	})

	// The public form's rule: a piece of ID carries no photo, whatever was sent.
	it('uploads nothing for a piece of ID', async () => {
		await newPostAction({
			request: requestFor({
				...FIELDS,
				category: 'documents',
				description: '',
				documentType: 'national_id',
				documentHolderName: 'Konan Aya',
			}),
		})

		expect(collectPhotoUrls).not.toHaveBeenCalled()
		expect(createOfficialPost).toHaveBeenCalledTimes(1)
	})

	it('answers an API refusal as a form error', async () => {
		createOfficialPost.mockRejectedValue(
			new ApiError(403, "Le compte de l'équipe RetrouveCI est introuvable."),
		)

		const result = await newPostAction({ request: requestFor(FIELDS) })

		expect(rootOf(result)).toBe(
			"Le compte de l'équipe RetrouveCI est introuvable.",
		)
	})

	it('answers the created listing', async () => {
		const result = await newPostAction({ request: requestFor(FIELDS) })

		expect(result).toEqual({ success: true, data: { id: 'post-1' } })
	})
})
