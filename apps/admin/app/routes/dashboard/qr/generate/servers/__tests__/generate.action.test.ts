import { MAX_GENERATE_COUNT } from '@app/contracts/qr-codes'
import type { ActionResult, FormErrors } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'

const { requireAdminSession, generateQrTokens } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	generateQrTokens: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/qr.service', () => ({ generateQrTokens }))

const { generateQrAction } = await import('../generate.action')

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return generateQrAction({
		request: new Request('http://localhost:3001/qr/generate', {
			method: 'POST',
			body,
		}),
	})
}

function errorsOf(result: ActionResult<unknown>): FormErrors {
	if (result.success) throw new Error('expected the action to report an error')
	return result.errors ?? {}
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	generateQrTokens.mockReset().mockResolvedValue([{ code: 'RCI-ABC123' }])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('generateQrAction', () => {
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(submit({ count: '10' })).rejects.toBeInstanceOf(Response)
		expect(generateQrTokens).not.toHaveBeenCalled()
	})

	// A form posts strings; the contract's union is what turns one into a number.
	it('sends the count as a number, not the posted string', async () => {
		const result = await submit({ count: '10' })

		expect(result).toEqual({ success: true, data: [{ code: 'RCI-ABC123' }] })
		expect(generateQrTokens).toHaveBeenCalledWith(
			10,
			undefined,
			expect.any(Request),
		)
	})

	it('sends a trimmed batch when one is given', async () => {
		await submit({ count: '4', batch: '  lot-aout  ' })

		expect(generateQrTokens).toHaveBeenCalledWith(
			4,
			'lot-aout',
			expect.any(Request),
		)
	})

	// The service signature is `batch: string | undefined`, and an empty string
	// would be stored as a batch name nobody typed.
	it('sends undefined rather than an empty batch', async () => {
		await submit({ count: '4', batch: '' })

		const [, batch] = generateQrTokens.mock.calls[0]
		expect(batch).toBeUndefined()
	})

	/** `exportCSV` is a browser concern; the payload schema omits it. */
	it('ignores exportCSV', async () => {
		await submit({ count: '4', exportCSV: 'true' })

		expect(generateQrTokens).toHaveBeenCalledWith(
			4,
			undefined,
			expect.any(Request),
		)
	})

	it('refuses a count above the contract ceiling', async () => {
		const result = await submit({ count: String(MAX_GENERATE_COUNT + 1) })

		expect(errorsOf(result).count?.message).toBe(
			`Maximum ${MAX_GENERATE_COUNT}`,
		)
		expect(generateQrTokens).not.toHaveBeenCalled()
	})

	it('refuses a count below the floor', async () => {
		expect(errorsOf(await submit({ count: '0' })).count?.message).toBe(
			'Minimum 1',
		)
		expect(generateQrTokens).not.toHaveBeenCalled()
	})

	// The union carries its own French message; without it this reports in
	// English, which is why the contract names it.
	it.each(['', 'dix', '4.5', '-2'])(
		'refuses the count %p in French',
		async count => {
			const result = await submit({ count })

			expect(errorsOf(result).count?.message).toBeTruthy()
			expect(errorsOf(result).count?.message).not.toMatch(/Invalid|expected/)
			expect(generateQrTokens).not.toHaveBeenCalled()
		},
	)

	it('reports an API refusal as a root error', async () => {
		generateQrTokens.mockRejectedValue(new ApiError(400, 'Lot déjà utilisé'))

		expect(errorsOf(await submit({ count: '4' })).root?.message).toBe(
			'Lot déjà utilisé',
		)
	})

	// Generation is admin-only, so a dead session belongs on the login page.
	it('redirects to login when the API answers 401', async () => {
		generateQrTokens.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(submit({ count: '4' })).rejects.toBeInstanceOf(Response)
	})

	it('lets a non-API failure through', async () => {
		generateQrTokens.mockRejectedValue(new Error('boom'))

		await expect(submit({ count: '4' })).rejects.toThrow('boom')
	})
})
