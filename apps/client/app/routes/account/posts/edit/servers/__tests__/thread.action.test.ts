import type { ActionResult } from '@/shared/types/action'

const rootOf = (result: ActionResult<unknown>) =>
	result.success ? undefined : result.errors?.root?.message

const { requireServerSession, replyToListingThread, markListingThreadRead } =
	vi.hoisted(() => ({
		requireServerSession: vi.fn(),
		replyToListingThread: vi.fn(),
		markListingThreadRead: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../../../servers/account-posts.service', () => ({
	replyToListingThread,
	markListingThreadRead,
}))

const { action, loader } = await import('../thread.action')
const { ApiError } = await import('@/shared/utils/api-fetch')

const params = { id: 'post-1' }

const requestFor = (fields: Record<string, string>) => {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.set(name, value)

	return new Request('http://localhost:3000/account/posts/post-1/comments', {
		method: 'POST',
		body,
	})
}

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	replyToListingThread.mockReset().mockResolvedValue({ id: 'comment-2' })
	markListingThreadRead.mockReset().mockResolvedValue(undefined)
})

describe('the thread loader', () => {
	// A reload lands here as a GET; a resource route has no page to show.
	it('sends a GET back to the listing', () => {
		const response = loader({ params })

		expect(response.headers.get('location')).toBe('/account/posts/post-1')
	})
})

describe('the thread action', () => {
	it('gates on the session before writing', async () => {
		requireServerSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			action({
				request: requestFor({ intent: 'reply', body: 'Voilà' }),
				params,
			}),
		).rejects.toBeInstanceOf(Response)
		expect(replyToListingThread).not.toHaveBeenCalled()
	})

	it('sends the poster’s reply on the listing in the path, trimmed', async () => {
		const result = await action({
			request: requestFor({
				intent: 'reply',
				body: '  J’ai ajouté la photo du dos  ',
			}),
			params,
		})

		expect(replyToListingThread).toHaveBeenCalledWith(
			'post-1',
			'J’ai ajouté la photo du dos',
			expect.any(Request),
		)
		expect(result).toEqual({ success: true, data: { id: 'comment-2' } })
	})

	it.each([
		[{}, 'Le message est requis'],
		[{ body: '   ' }, 'Le message ne peut pas être vide'],
	])('refuses %j in French, sending nothing', async (fields, message) => {
		const result = await action({
			request: requestFor({ intent: 'reply', ...fields }),
			params,
		})

		expect(result).toEqual({
			success: false,
			errors: { body: { type: 'custom', message } },
		})
		expect(replyToListingThread).not.toHaveBeenCalled()
	})

	// The poster's own ceiling answers in French, and it is worth reading.
	it('reports the API message when the reply is refused', async () => {
		replyToListingThread.mockRejectedValue(
			new ApiError(429, 'Trop de messages envoyés depuis ce compte.'),
		)

		const result = await action({
			request: requestFor({ intent: 'reply', body: 'Voilà' }),
			params,
		})

		expect(rootOf(result)).toBe('Trop de messages envoyés depuis ce compte.')
	})

	it('marks the thread read', async () => {
		const result = await action({
			request: requestFor({ intent: 'read' }),
			params,
		})

		expect(markListingThreadRead).toHaveBeenCalledWith(
			'post-1',
			expect.any(Request),
		)
		expect(result).toEqual({ success: true })
	})

	it('refuses an unknown intent', async () => {
		const result = await action({
			request: requestFor({ intent: 'delete' }),
			params,
		})

		expect(rootOf(result)).toBe('Intent inconnu')
		expect(replyToListingThread).not.toHaveBeenCalled()
		expect(markListingThreadRead).not.toHaveBeenCalled()
	})
})
