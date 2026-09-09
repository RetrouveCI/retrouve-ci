import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

/** `errors` lives on the failure branch of the union only. */
const errorsOf = (result: ActionResult) =>
	result.success ? undefined : result.errors

const { getServerSession, deleteLostItem, updateLostItemResolution } =
	vi.hoisted(() => ({
		getServerSession: vi.fn(),
		deleteLostItem: vi.fn(),
		updateLostItemResolution: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../account-posts.service', () => ({
	deleteLostItem,
	updateLostItemResolution,
}))

const { accountPostsAction } = await import('../account-posts.action')

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/account/posts', {
		method: 'POST',
		body,
	})
}

const redirectTo = (value: unknown) =>
	value instanceof Response ? value.headers.get('location') : null

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	deleteLostItem.mockReset().mockResolvedValue(undefined)
	updateLostItemResolution.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('accountPostsAction', () => {
	// Deletion is irreversible, so the gate comes before the body is even read.
	it('sends an anonymous visitor to the login page, deleting nothing', async () => {
		getServerSession.mockResolvedValue(null)

		const thrown = await accountPostsAction({
			request: requestFor({ intent: 'delete', id: 'post-1' }),
		}).catch((error: unknown) => error)

		expect(redirectTo(thrown)).toBe('/login')
		expect(deleteLostItem).not.toHaveBeenCalled()
	})

	describe('delete', () => {
		it('deletes the listing named in the form', async () => {
			const result = await accountPostsAction({
				request: requestFor({ intent: 'delete', id: 'post-1' }),
			})

			expect(result).toEqual({ success: true })
			expect(deleteLostItem).toHaveBeenCalledWith('post-1', expect.any(Request))
			expect(updateLostItemResolution).not.toHaveBeenCalled()
		})

		it('refuses a delete with no id', async () => {
			const result = await accountPostsAction({
				request: requestFor({ intent: 'delete' }),
			})

			expect(result.success).toBe(false)
			expect(deleteLostItem).not.toHaveBeenCalled()
		})

		// The API owns ownership; a 403 belongs on the form, not on a crashed page.
		it('reports a refusal as a root error', async () => {
			deleteLostItem.mockRejectedValue(new ApiError(403, 'Annonce non vôtre'))

			const result = await accountPostsAction({
				request: requestFor({ intent: 'delete', id: 'post-1' }),
			})

			expect(errorsOf(result)?.root?.message).toBe('Annonce non vôtre')
		})
	})

	describe('update-status', () => {
		it.each(['active', 'resolved', 'expired'])(
			'marks a listing as %s',
			async status => {
				const result = await accountPostsAction({
					request: requestFor({
						intent: 'update-status',
						id: 'post-1',
						status,
					}),
				})

				expect(result).toEqual({ success: true })
				expect(updateLostItemResolution).toHaveBeenCalledWith(
					'post-1',
					status,
					expect.any(Request),
				)
				expect(deleteLostItem).not.toHaveBeenCalled()
			},
		)

		// `published` is a moderation status, not a resolution one.
		it.each(['published', 'pending', '', 'RESOLVED'])(
			'refuses the status %p',
			async status => {
				const result = await accountPostsAction({
					request: requestFor({
						intent: 'update-status',
						id: 'post-1',
						status,
					}),
				})

				expect(result.success).toBe(false)
				expect(updateLostItemResolution).not.toHaveBeenCalled()
			},
		)
	})

	it.each(['', 'burn', 'DELETE'])(
		'refuses the unknown intent %p',
		async intent => {
			const result = await accountPostsAction({
				request: requestFor({ intent, id: 'post-1' }),
			})

			expect(result.success).toBe(false)
			expect(deleteLostItem).not.toHaveBeenCalled()
			expect(updateLostItemResolution).not.toHaveBeenCalled()
		},
	)

	it('redirects when the API answers 401', async () => {
		deleteLostItem.mockRejectedValue(new ApiError(401, 'Non autorisé'))

		const thrown = await accountPostsAction({
			request: requestFor({ intent: 'delete', id: 'post-1' }),
		}).catch((error: unknown) => error)

		expect(redirectTo(thrown)).toBe('/login')
	})
})
