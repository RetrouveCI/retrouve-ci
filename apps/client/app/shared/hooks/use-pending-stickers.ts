import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { useAuth } from '@/context/auth'
import type { PendingStickerCount } from '@/routes/account/stickers/servers/pending-count.loader'

/**
 * The standing task a delivery notification cannot carry: it is read once,
 * twelve stickers take days. Loaded beside the shell rather than from a root
 * loader, which would cost a session round-trip on every navigation.
 */
export function usePendingStickers(): number {
	const { isAuthenticated } = useAuth()
	const fetcher = useFetcher<PendingStickerCount>()

	useEffect(() => {
		if (!isAuthenticated) return

		fetcher.load('/account/stickers/pending')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated])

	return isAuthenticated ? (fetcher.data?.pending ?? 0) : 0
}
