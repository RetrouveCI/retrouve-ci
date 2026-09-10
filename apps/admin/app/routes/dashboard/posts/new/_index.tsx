import type { RouteHandle } from '@/shared/helpers/page-meta'
import { NewPostForm } from './components/new-post-form'
import { newPostAction } from './servers/new-post.action'

export const action = newPostAction

export const handle: RouteHandle = {
	title: 'Publier pour l’équipe',
	breadcrumb: [{ label: 'Posts', to: '/posts' }],
}

export default function NewPostPage() {
	return (
		<div className="p-4 lg:p-6">
			<NewPostForm />
		</div>
	)
}
