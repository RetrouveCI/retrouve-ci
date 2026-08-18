import { Outlet } from 'react-router'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BottomTabBar } from '@/components/bottom-tab-bar'

export default function AppLayout() {
	return (
		<>
			<Header />
			<div className="pb-16 md:pb-0">
				<Outlet />
			</div>
			<Footer />
			<BottomTabBar />
		</>
	)
}
