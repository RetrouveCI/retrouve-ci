import { useSearchParams } from 'react-router'
import { OfflineContent } from '@/components/offline-content'
import { pageMeta } from '@/shared/helpers/page-meta'
import { retryTarget } from './helpers/retry-target'

export function meta() {
	return [
		...pageMeta({ title: 'Hors connexion' }),
		// A crawler that reaches this page has been handed the wrong document.
		{ name: 'robots', content: 'noindex' },
	]
}

export default function OfflinePage() {
	const [searchParams] = useSearchParams()

	return <OfflineContent retryTo={retryTarget(searchParams.get('from'))} />
}
