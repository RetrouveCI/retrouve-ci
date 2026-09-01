import { PublishFlow } from '../components/publish-flow'
import { publishLoader } from '../servers/publish.loader'
import { publishAction } from '../servers/publish.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export const loader = publishLoader

export const action = ({ request }: Route.ActionArgs) =>
	publishAction(request, 'lost')

export function meta() {
	return pageMeta({
		title: 'Publier un objet perdu',
		description:
			"Décrivez l'objet que vous avez perdu pour que quelqu'un puisse vous aider.",
	})
}

export default function PublishLostPage() {
	return <PublishFlow type="lost" />
}
