const DECLINED_KEY = 'retrouveci.install-declined.v1'

/** The query value a screen carries when it has just succeeded at something. */
export const SUCCESS_PARAM = 'success'

export type InstallCue = 'published' | 'activated'

/**
 * Chromium's install event, specified outside the DOM standard and so absent
 * from `lib.dom`. Augmenting `WindowEventMap` is what types the listener below
 * without an assertion.
 */
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent
	}

	interface Window {
		__retrouveciInstallPrompt?: BeforeInstallPromptEvent | null
	}
}

/**
 * Measured: on a cold load the event beats React's hydration, so a listener the
 * root registers in an effect misses it and the offer is lost for the whole
 * visit. A blocking script in `<head>` is the only one certain to be in place
 * in time — the same reason the theme is settled there (§ R25).
 */
export const INSTALL_PROMPT_SCRIPT = `(function(){try{
window.__retrouveciInstallPrompt=null;
addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__retrouveciInstallPrompt=e});
}catch(e){}})()`

let deferred: BeforeInstallPromptEvent | null = null
let declined = false

const subscribers = new Set<() => void>()

function publish(): void {
	for (const notify of subscribers) notify()
}

/**
 * Kept in a module rather than in component state: the browser hands the event
 * over long before the screen that will offer the install is mounted, and it
 * hands it over once.
 */
export function startInstallPromptCapture(): () => void {
	declined = readDeclined()
	// Whatever the head script caught before React was there to ask.
	deferred = window.__retrouveciInstallPrompt ?? null
	publish()

	const capture = (event: BeforeInstallPromptEvent) => {
		// Left alone, Chromium shows its own bar and the app loses the say over
		// when the offer appears — which is the whole of R25's acceptance.
		event.preventDefault()
		deferred = event
		publish()
	}

	const forget = () => {
		deferred = null
		window.__retrouveciInstallPrompt = null
		publish()
	}

	window.addEventListener('beforeinstallprompt', capture)
	window.addEventListener('appinstalled', forget)

	return () => {
		window.removeEventListener('beforeinstallprompt', capture)
		window.removeEventListener('appinstalled', forget)
	}
}

export function subscribeToInstallPrompt(onChange: () => void): () => void {
	subscribers.add(onChange)

	return () => {
		subscribers.delete(onChange)
	}
}

export function isInstallable(): boolean {
	return deferred !== null
}

export function isInstallDeclined(): boolean {
	return declined
}

/** Answers whether the browser's own dialog ended in an install. */
export async function requestInstall(): Promise<boolean> {
	const event = deferred
	if (event === null) return false

	// One event, one dialog: Chromium refuses a second `prompt()` on the same
	// one, so the offer is spent whatever the visitor answers.
	deferred = null
	window.__retrouveciInstallPrompt = null
	publish()

	try {
		await event.prompt()
		const { outcome } = await event.userChoice

		return outcome === 'accepted'
	} catch {
		return false
	}
}

/** « Plus tard » is final: the sheet never opens again on this browser. */
export function declineInstall(): void {
	declined = true
	publish()

	try {
		localStorage.setItem(DECLINED_KEY, '1')
	} catch {
		return
	}
}

function readDeclined(): boolean {
	try {
		return localStorage.getItem(DECLINED_KEY) === '1'
	} catch {
		return false
	}
}
