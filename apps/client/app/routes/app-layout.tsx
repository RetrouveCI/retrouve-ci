import { Outlet } from 'react-router'
import { Header } from '@/shared/components/header'
import { Footer } from '@/shared/components/footer'

export default function AppLayout() {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	)
}
