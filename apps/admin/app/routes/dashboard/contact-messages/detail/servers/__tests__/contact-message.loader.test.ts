const { requireAdminSession, getContactMessageById } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getContactMessageById: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/contact-messages.service', () => ({
	getContactMessageById,
}))

const { contactMessageLoader } = await import('../contact-message.loader')

const request = new Request('http://localhost:3001/contact-messages/msg-1')
const params = { id: 'msg-1' }

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getContactMessageById.mockReset().mockResolvedValue({ id: 'msg-1' })
})

describe('contactMessageLoader', () => {
	it('does not read the message when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(contactMessageLoader({ request, params })).rejects.toBe(
			redirect,
		)
		expect(getContactMessageById).not.toHaveBeenCalled()
	})

	// The API marks a new message read as it answers: the page is the signal.
	it('reads the message in the path, forwarding the session', async () => {
		await expect(contactMessageLoader({ request, params })).resolves.toEqual({
			message: { id: 'msg-1' },
		})
		expect(getContactMessageById).toHaveBeenCalledWith('msg-1', request)
	})
})

// The mocks hoist above the import under test, so the file must be a module.
export {}
