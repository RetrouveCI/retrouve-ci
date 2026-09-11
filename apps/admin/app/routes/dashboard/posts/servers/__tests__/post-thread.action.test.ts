import type { ActionResult } from '@/shared/types/action'

const rootOf = (result: ActionResult<unknown>) =>
	result.success ? undefined : result.errors?.root?.message

const { requireAdminSession, commentOnPost, markPostThreadRead } = vi.hoisted(
	() => ({
		requireAdminSession: vi.fn(),
		commentOnPost: vi.fn(),
		markPostThreadRead: vi.fn(),
	}),
)

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../posts.service', () => ({ commentOnPost, markPostThreadRead }))

const { action } = await import('../post-thread.action')
const { ApiError } = await import('@/shared/utils/api-fetch')

const params = { id: 'post-1' }

const requestFor = (fields: Record<string, string>) => {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.set(name, value)

	return new Request('http://localhost:3001/posts/post-1/comments', {
		method: 'POST',
		body,
	})
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	commentOnPost.mockReset().mockResolvedValue({ id: 'comment-1' })
	markPostThreadRead.mockReset().mockResolvedValue(undefined)
})

describe('the post thread action', () => {
	it('gates on the admin session before writing', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			action({
				request: requestFor({ intent: 'comment', body: 'Bonjour' }),
				params,
			}),
		).rejects.toBeInstanceOf(Response)
		expect(commentOnPost).not.toHaveBeenCalled()
	})

	it('sends the desk’s comment on the listing in the path, trimmed', async () => {
		const result = await action({
			request: requestFor({
				intent: 'comment',
				body: '  Ajoutez une photo du dos  ',
			}),
			params,
		})

		expect(commentOnPost).toHaveBeenCalledWith(
			'post-1',
			'Ajoutez une photo du dos',
			expect.any(Request),
		)
		expect(result).toEqual({ success: true, data: { id: 'comment-1' } })
	})

	it.each([
		[{}, 'Le message est requis'],
		[{ body: '   ' }, 'Le message ne peut pas être vide'],
	])('refuses %j in French, sending nothing', async (fields, message) => {
		const result = await action({
			request: requestFor({ intent: 'comment', ...fields }),
			params,
		})

		expect(result).toEqual({
			success: false,
			errors: { body: { type: 'custom', message } },
		})
		expect(commentOnPost).not.toHaveBeenCalled()
	})

	it('reports the API message when the comment fails', async () => {
		commentOnPost.mockRejectedValue(new ApiError(404, 'Annonce introuvable'))

		const result = await action({
			request: requestFor({ intent: 'comment', body: 'Bonjour' }),
			params,
		})

		expect(rootOf(result)).toBe('Annonce introuvable')
	})

	it('marks the thread read', async () => {
		const result = await action({
			request: requestFor({ intent: 'read' }),
			params,
		})

		expect(markPostThreadRead).toHaveBeenCalledWith(
			'post-1',
			expect.any(Request),
		)
		expect(result).toEqual({ success: true })
	})

	it('refuses an unknown intent', async () => {
		const result = await action({
			request: requestFor({ intent: 'moderate' }),
			params,
		})

		expect(rootOf(result)).toBe('Intent inconnu')
		expect(commentOnPost).not.toHaveBeenCalled()
		expect(markPostThreadRead).not.toHaveBeenCalled()
	})

	// Not an outcome but a bug: it belongs in the error boundary.
	it('lets a non-API failure through', async () => {
		commentOnPost.mockRejectedValue(new Error('boom'))

		await expect(
			action({
				request: requestFor({ intent: 'comment', body: 'Bonjour' }),
				params,
			}),
		).rejects.toThrow('boom')
	})
})
