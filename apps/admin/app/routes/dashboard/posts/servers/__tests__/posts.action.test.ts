import { MODERATION_STATUSES } from '@app/contracts/lost-items'
import type { ActionResult } from '@/shared/types/action'

const rootOf = (result: ActionResult<unknown>) =>
	result.success ? undefined : result.errors?.root?.message

const { requireAdminSession, moderatePost } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	moderatePost: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../posts.service', () => ({ moderatePost }))

const { postsAction } = await import('../posts.action')
const { ApiError } = await import('@/shared/utils/api-fetch')

const requestFor = (fields: Record<string, string>) => {
	const body = new FormData()
	for (const [name, value] of Object.entries(fields)) body.set(name, value)

	return new Request('http://localhost:3001/posts', { method: 'POST', body })
}

/** The action answers `{ ok, error }`, wrapped in `data()` on a failure. */
beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	moderatePost.mockReset().mockResolvedValue({ id: 'post-1' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('postsAction', () => {
	it('gates on the admin session before moderating', async () => {
		const request = requestFor({ intent: 'moderate', id: 'post-1' })
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(postsAction({ request })).rejects.toBeInstanceOf(Response)
		expect(moderatePost).not.toHaveBeenCalled()
	})

	it.each(MODERATION_STATUSES)('moderates to %s', async moderationStatus => {
		const result = await postsAction({
			request: requestFor({
				intent: 'moderate',
				id: 'post-1',
				moderationStatus,
			}),
		})

		expect(moderatePost).toHaveBeenCalledWith(
			{ id: 'post-1', moderationStatus },
			expect.any(Request),
		)
		expect(result).toEqual({ success: true, data: { id: 'post-1' } })
	})

	it('carries the reason and its note when the dialog gave them', async () => {
		await postsAction({
			request: requestFor({
				intent: 'moderate',
				id: 'post-1',
				moderationStatus: 'hidden',
				moderationReason: 'other',
				moderationReasonNote: 'La 2e photo montre une carte bancaire.',
			}),
		})

		expect(moderatePost).toHaveBeenCalledWith(
			{
				id: 'post-1',
				moderationStatus: 'hidden',
				moderationReason: 'other',
				moderationReasonNote: 'La 2e photo montre une carte bancaire.',
			},
			expect.any(Request),
		)
	})

	// The dialog posts every field, so a reason nobody chose arrives as `''` —
	// which the contract would refuse if it were passed through as a value.
	it('reads an untouched reason as absent, not as an empty one', async () => {
		await postsAction({
			request: requestFor({
				intent: 'moderate',
				id: 'post-1',
				moderationStatus: 'hidden',
				moderationReason: '',
				moderationReasonNote: '',
			}),
		})

		expect(moderatePost).toHaveBeenCalledWith(
			{ id: 'post-1', moderationStatus: 'hidden' },
			expect.any(Request),
		)
	})

	it('refuses a reason on the way back to published', async () => {
		const result = await postsAction({
			request: requestFor({
				intent: 'moderate',
				id: 'post-1',
				moderationStatus: 'published',
				moderationReason: 'duplicate',
			}),
		})

		// A schema refusal names its field, so the dialog shows it where the
		// moderator chose the reason rather than in a banner.
		expect(result).toEqual({
			success: false,
			errors: {
				moderationReason: {
					type: 'custom',
					message: "Un motif ne s'attache qu'à un masquage",
				},
			},
		})
		expect(moderatePost).not.toHaveBeenCalled()
	})

	it('refuses a status the contract does not know, in French', async () => {
		const result = await postsAction({
			request: requestFor({
				intent: 'moderate',
				id: 'post-1',
				moderationStatus: 'valide',
			}),
		})

		expect(result).toEqual({
			success: false,
			errors: {
				moderationStatus: {
					type: 'custom',
					message: 'Statut de modération invalide',
				},
			},
		})
		expect(moderatePost).not.toHaveBeenCalled()
	})

	it('refuses an unknown intent', async () => {
		const result = await postsAction({
			request: requestFor({ intent: 'burn' }),
		})

		expect(rootOf(result)).toBe('Intent inconnu')
		expect(moderatePost).not.toHaveBeenCalled()
	})

	// It used to answer « Intent inconnu », naming the wrong problem: the intent
	// was right and the id was missing.
	it('names the missing id on a moderate intent that carries none', async () => {
		const result = await postsAction({
			request: requestFor({
				intent: 'moderate',
				moderationStatus: 'published',
			}),
		})

		expect(rootOf(result)).toBe('ID manquant')
		expect(moderatePost).not.toHaveBeenCalled()
	})

	it('reports the API message when the call fails', async () => {
		moderatePost.mockRejectedValue(new ApiError(404, 'Annonce introuvable'))

		const result = await postsAction({
			request: requestFor({
				intent: 'moderate',
				id: 'missing',
				moderationStatus: 'published',
			}),
		})

		expect(rootOf(result)).toBe('Annonce introuvable')
	})

	// Not an outcome but a bug: it belongs in the error boundary.
	it('lets a non-API failure through', async () => {
		moderatePost.mockRejectedValue(new Error('boom'))

		await expect(
			postsAction({
				request: requestFor({
					intent: 'moderate',
					id: 'post-1',
					moderationStatus: 'published',
				}),
			}),
		).rejects.toThrow('boom')
	})
})
