import { Outlet } from 'react-router'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BottomTabBar } from '@/components/bottom-tab-bar'

export default function AppLayout() {
	return (
		<>
			<Header />
			{/* The tab bar is 4rem tall plus the device inset, so the spacer that
			    clears it has to grow by the same inset — otherwise the last rows of
			    every page sit behind it on a notched phone. */}
			<div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
				<Outlet />
			</div>
			<Footer />
			<BottomTabBar />
		</>
	)
}
