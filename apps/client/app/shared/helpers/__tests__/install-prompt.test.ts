import type * as InstallPrompt from '../install-prompt'

const KEY = 'retrouveci.install-declined.v1'

type Handler = (event: unknown) => void

let store: Map<string, string>
let handlers: Map<string, Set<Handler>>

function storageOver(entries: Map<string, string>) {
	return {
		getItem: (key: string) => entries.get(key) ?? null,
		setItem: (key: string, value: string) => void entries.set(key, value),
		removeItem: (key: string) => void entries.delete(key),
		clear: () => entries.clear(),
		key: (index: number) => [...entries.keys()][index] ?? null,
		get length() {
			return entries.size
		},
	}
}

function windowOver(registry: Map<string, Set<Handler>>) {
	return {
		__retrouveciInstallPrompt: null as unknown,
		addEventListener: (type: string, handler: Handler) => {
			const set = registry.get(type) ?? new Set<Handler>()
			set.add(handler)
			registry.set(type, set)
		},
		removeEventListener: (type: string, handler: Handler) => {
			registry.get(type)?.delete(handler)
		},
	}
}

function dispatch(type: string, event: unknown) {
	for (const handler of handlers.get(type) ?? []) handler(event)
}

function offer(outcome: 'accepted' | 'dismissed' = 'accepted') {
	return {
		preventDefault: vi.fn(),
		prompt: vi.fn().mockResolvedValue(undefined),
		userChoice: Promise.resolve({ outcome }),
	}
}

/** The module keeps the browser's one-shot event, so each test gets its own. */
async function load(): Promise<typeof InstallPrompt> {
	vi.resetModules()
	return import('../install-prompt')
}

beforeEach(() => {
	store = new Map()
	handlers = new Map()
	vi.stubGlobal('localStorage', storageOver(store))
	vi.stubGlobal('window', windowOver(handlers))
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('capturing the browser offer', () => {
	it('has nothing to install before the browser offers', async () => {
		const module = await load()
		module.startInstallPromptCapture()

		expect(module.isInstallable()).toBe(false)
	})

	it('keeps the browser own bar shut so the app chooses the moment', async () => {
		const module = await load()
		module.startInstallPromptCapture()

		const event = offer()
		dispatch('beforeinstallprompt', event)

		expect(event.preventDefault).toHaveBeenCalled()
		expect(module.isInstallable()).toBe(true)
	})

	it('tells subscribers when the offer lands', async () => {
		const module = await load()
		const onChange = vi.fn()
		module.subscribeToInstallPrompt(onChange)
		module.startInstallPromptCapture()
		onChange.mockClear()

		dispatch('beforeinstallprompt', offer())

		expect(onChange).toHaveBeenCalled()
	})

	it('stops listening when the root unmounts', async () => {
		const module = await load()
		module.startInstallPromptCapture()()

		dispatch('beforeinstallprompt', offer())

		expect(module.isInstallable()).toBe(false)
	})

	it('adopts what the head script caught before React was there', async () => {
		const stashed = offer()
		vi.stubGlobal('window', {
			...windowOver(handlers),
			__retrouveciInstallPrompt: stashed,
		})

		const module = await load()
		module.startInstallPromptCapture()

		expect(module.isInstallable()).toBe(true)
		await expect(module.requestInstall()).resolves.toBe(true)
		expect(stashed.prompt).toHaveBeenCalled()
	})

	it('empties the head script stash once the offer is spent', async () => {
		const stashed = offer()
		const fake = { ...windowOver(handlers), __retrouveciInstallPrompt: stashed }
		vi.stubGlobal('window', fake)

		const module = await load()
		module.startInstallPromptCapture()
		await module.requestInstall()

		expect(fake.__retrouveciInstallPrompt).toBeNull()
	})

	it('withdraws the offer once the app is installed', async () => {
		const module = await load()
		module.startInstallPromptCapture()
		dispatch('beforeinstallprompt', offer())

		dispatch('appinstalled', {})

		expect(module.isInstallable()).toBe(false)
	})
})

describe('asking the browser to install', () => {
	it('answers true when the visitor goes through with it', async () => {
		const module = await load()
		module.startInstallPromptCapture()
		const event = offer('accepted')
		dispatch('beforeinstallprompt', event)

		await expect(module.requestInstall()).resolves.toBe(true)
		expect(event.prompt).toHaveBeenCalled()
	})

	it('answers false when the visitor backs out of the browser dialog', async () => {
		const module = await load()
		module.startInstallPromptCapture()
		dispatch('beforeinstallprompt', offer('dismissed'))

		await expect(module.requestInstall()).resolves.toBe(false)
	})

	it('spends the offer, since the event serves one dialog only', async () => {
		const module = await load()
		module.startInstallPromptCapture()
		const event = offer()
		dispatch('beforeinstallprompt', event)

		await module.requestInstall()

		expect(module.isInstallable()).toBe(false)
		await expect(module.requestInstall()).resolves.toBe(false)
		expect(event.prompt).toHaveBeenCalledTimes(1)
	})

	it('answers false where the browser never offered', async () => {
		const module = await load()
		module.startInstallPromptCapture()

		await expect(module.requestInstall()).resolves.toBe(false)
	})
})

describe('« Plus tard »', () => {
	it('is not the state a fresh browser starts in', async () => {
		const module = await load()
		module.startInstallPromptCapture()

		expect(module.isInstallDeclined()).toBe(false)
	})

	it('survives a reload', async () => {
		const first = await load()
		first.startInstallPromptCapture()
		first.declineInstall()

		expect(store.get(KEY)).toBe('1')

		const second = await load()
		second.startInstallPromptCapture()

		expect(second.isInstallDeclined()).toBe(true)
	})

	it('leaves the install page its own button', async () => {
		const module = await load()
		module.startInstallPromptCapture()
		dispatch('beforeinstallprompt', offer())

		module.declineInstall()

		expect(module.isInstallDeclined()).toBe(true)
		expect(module.isInstallable()).toBe(true)
	})

	it('still holds for the session on a browser that refuses storage', async () => {
		vi.stubGlobal('localStorage', {
			getItem: () => {
				throw new Error('denied')
			},
			setItem: () => {
				throw new Error('denied')
			},
		})

		const module = await load()
		module.startInstallPromptCapture()
		module.declineInstall()

		expect(module.isInstallDeclined()).toBe(true)
	})
})
