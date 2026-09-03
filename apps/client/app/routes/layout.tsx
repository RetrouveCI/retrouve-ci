import { Outlet } from 'react-router'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BottomTabBar } from '@/components/bottom-tab-bar'
import { OfflineBanner } from '@/components/offline-banner'

export default function AppLayout() {
	return (
		<>
			<Header />
			{/* The tab bar is 4rem tall plus the device inset, so the spacer that
			    clears it has to grow by the same inset — otherwise the last rows of
			    every page sit behind it on a notched phone. */}
			<div className="safe-x pb-[calc(4rem+var(--safe-bottom))] lg:pb-0">
				<OfflineBanner />
				<Outlet />
			</div>
			<Footer />
			<BottomTabBar />
		</>
	)
}
