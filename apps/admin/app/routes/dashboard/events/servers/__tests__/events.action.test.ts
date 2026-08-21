import type { ActionResult, FormErrors } from '@/shared/types/action'

const { requireAdminSession, createEvent, updateEvent, deleteEvent } =
	vi.hoisted(() => ({
		requireAdminSession: vi.fn(),
		createEvent: vi.fn(),
		updateEvent: vi.fn(),
		deleteEvent: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../events.service', () => ({ createEvent, updateEvent, deleteEvent }))

const { eventsAction } = await import('../events.action')

const VALID_FIELDS = {
	title: 'Braderie du Plateau',
	description: 'Une braderie solidaire ouverte à tous les habitants.',
	location: 'Place de la République',
	ville: 'Abidjan',
	commune: 'Plateau',
	eventDate: '2026-09-01T18:30',
}

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return eventsAction({
		request: new Request('http://localhost:3001/events', {
			method: 'POST',
			body,
		}),
	})
}

function errorsOf(result: ActionResult): FormErrors {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	createEvent.mockReset().mockResolvedValue({ id: 'evt-1' })
	updateEvent.mockReset().mockResolvedValue({ id: 'evt-1' })
	deleteEvent.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('eventsAction', () => {
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			submit({ intent: 'delete', id: 'evt-1' }),
		).rejects.toBeInstanceOf(Response)
		expect(deleteEvent).not.toHaveBeenCalled()
	})

	describe('create', () => {
		it('sends the contract-trimmed values, not what the form posted', async () => {
			const result = await submit({
				intent: 'create',
				...VALID_FIELDS,
				title: '  Braderie du Plateau  ',
				ville: '  Abidjan  ',
			})

			expect(result).toEqual({ success: true })
			expect(createEvent).toHaveBeenCalledWith(
				VALID_FIELDS,
				expect.any(Request),
			)
		})

		it('omits a commune left blank rather than sending an empty string', async () => {
			await submit({ intent: 'create', ...VALID_FIELDS, commune: '' })

			const [payload] = createEvent.mock.calls[0]
			expect(payload).not.toHaveProperty('commune')
		})

		// The contract's messages are the ones the form fields render.
		it('answers field errors in French without calling the API', async () => {
			const result = await submit({
				intent: 'create',
				...VALID_FIELDS,
				title: 'ab',
				eventDate: 'demain',
			})

			expect(result.success).toBe(false)
			expect(errorsOf(result).title?.message).toBe(
				'Le titre doit contenir au moins 3 caractères',
			)
			expect(errorsOf(result).eventDate?.message).toBe('Date invalide')
			expect(createEvent).not.toHaveBeenCalled()
		})
	})

	describe('update', () => {
		it('sends the whole event the form re-posts', async () => {
			const result = await submit({
				intent: 'update',
				id: 'evt-1',
				...VALID_FIELDS,
			})

			expect(result).toEqual({ success: true })
			expect(updateEvent).toHaveBeenCalledWith(
				'evt-1',
				VALID_FIELDS,
				expect.any(Request),
			)
		})

		it('refuses an update with no id', async () => {
			const result = await submit({ intent: 'update', ...VALID_FIELDS })

			expect(errorsOf(result).root?.message).toBe(
				"L'événement à modifier est introuvable",
			)
			expect(updateEvent).not.toHaveBeenCalled()
		})
	})

	describe('update-status', () => {
		it('patches only the status', async () => {
			const result = await submit({
				intent: 'update-status',
				id: 'evt-1',
				status: 'published',
			})

			expect(result).toEqual({ success: true })
			expect(updateEvent).toHaveBeenCalledWith(
				'evt-1',
				{ status: 'published' },
				expect.any(Request),
			)
		})

		it('refuses a status the contract does not know', async () => {
			const result = await submit({
				intent: 'update-status',
				id: 'evt-1',
				status: 'vole',
			})

			expect(errorsOf(result).root?.message).toBe('Statut invalide')
			expect(updateEvent).not.toHaveBeenCalled()
		})
	})

	it('deletes by id, and refuses to without one', async () => {
		expect(await submit({ intent: 'delete', id: 'evt-1' })).toEqual({
			success: true,
		})
		expect(deleteEvent).toHaveBeenCalledWith('evt-1', expect.any(Request))

		const result = await submit({ intent: 'delete' })
		expect(errorsOf(result).root?.message).toBe(
			"L'événement à supprimer est introuvable",
		)
	})

	it('refuses an unknown intent', async () => {
		const result = await submit({ intent: 'archiver' })

		expect(errorsOf(result).root?.message).toBe('Action inconnue')
	})
})
