import { useSyncExternalStore } from 'react'
import {
	isInstallDeclined,
	isInstallable,
	subscribeToInstallPrompt,
} from '@/shared/helpers/install-prompt'

/** Neither flag can be true where there is no browser to install into. */
const NO = () => false

/**
 * Two flags, not one: declining the sheet must not take the button off the
 * install page, which is the permanent way in.
 */
export function useInstallPrompt(): {
	installable: boolean
	declined: boolean
} {
	const installable = useSyncExternalStore(
		subscribeToInstallPrompt,
		isInstallable,
		NO,
	)

	const declined = useSyncExternalStore(
		subscribeToInstallPrompt,
		isInstallDeclined,
		NO,
	)

	return { installable, declined }
}
