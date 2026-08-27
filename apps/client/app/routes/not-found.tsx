import { data } from 'react-router'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { NotFoundContent } from '@/components/not-found-content'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Page introuvable',
		description: "Cette page n'existe pas ou a été déplacée.",
	})
}

export function loader() {
	throw data(null, { status: 404 })
}

export default function NotFound() {
	return (
		<>
			<Header />
			<NotFoundContent />
			<Footer />
		</>
	)
}
