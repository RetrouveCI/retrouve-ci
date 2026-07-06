import { Outlet } from 'react-router'
import { Header } from '@/shared/components/header'
import { Footer } from '@/shared/components/footer'
import { BottomTabBar } from '@/shared/components/bottom-tab-bar'

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
