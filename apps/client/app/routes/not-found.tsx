import { data } from 'react-router'
import { Header } from '@/shared/components/header'
import { Footer } from '@/shared/components/footer'
import { NotFoundContent } from '@/shared/components/not-found-content'

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
