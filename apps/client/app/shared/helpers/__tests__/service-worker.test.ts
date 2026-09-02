import { registerServiceWorker } from '../service-worker'

const update = vi.fn()
const register = vi.fn()

beforeEach(() => {
	update.mockReset().mockResolvedValue(undefined)
	register.mockReset().mockResolvedValue({ update })
	vi.stubGlobal('navigator', { serviceWorker: { register } })
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('registering the worker', () => {
	it('asks for the script at the scope root, past the HTTP cache', () => {
		registerServiceWorker()

		expect(register).toHaveBeenCalledWith('/sw.js', {
			updateViaCache: 'none',
		})
	})

	it('checks for a newer worker on every load', async () => {
		registerServiceWorker()
		await vi.waitFor(() => expect(update).toHaveBeenCalled())
	})

	it('does nothing on a browser that has no workers', () => {
		vi.stubGlobal('navigator', {})

		expect(() => registerServiceWorker()).not.toThrow()
		expect(register).not.toHaveBeenCalled()
	})

	it('does nothing on the server, where there is no navigator', () => {
		vi.stubGlobal('navigator', undefined)

		expect(() => registerServiceWorker()).not.toThrow()
	})

	it('swallows a registration that fails, rather than taking the page down', async () => {
		register.mockRejectedValue(new Error('no'))

		expect(() => registerServiceWorker()).not.toThrow()
		await vi.waitFor(() => expect(register).toHaveBeenCalled())
	})
})
