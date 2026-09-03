import { PublishFlow } from '../components/publish-flow'
import { publishLoader } from '../servers/publish.loader'
import { publishAction } from '../servers/publish.action'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export const loader = publishLoader

export const action = ({ request }: Route.ActionArgs) =>
	publishAction(request, 'found')

export function meta() {
	return pageMeta({
		title: 'Publier un objet retrouvé',
		description:
			"Décrivez l'objet que vous avez retrouvé pour aider son propriétaire à le récupérer.",
	})
}

export default function PublishFoundPage({ loaderData }: Route.ComponentProps) {
	return <PublishFlow type="found" contactName={loaderData.contactName} />
}
