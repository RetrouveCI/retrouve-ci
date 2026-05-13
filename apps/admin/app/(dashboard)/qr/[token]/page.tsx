'use client'

import { Button } from '@retrouve-ci/ui/components'
import { use, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/admin/topbar'
import { useQRToken } from '@/application/qr/use-qr-tokens'
import { useEvents } from '@/application/events/use-events'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { TokenDetailsCard } from './components/TokenDetailsCard'
import { TokenTimeline } from './components/TokenTimeline'
import { TokenActionsCard } from './components/TokenActionsCard'
import { RevokeTokenDialog } from './components/RevokeTokenDialog'

export default function QRTokenDetailPage({
	params,
}: {
	params: Promise<{ token: string }>
}) {
	const { token: tokenId } = use(params)
	const [showRevokeDialog, setShowRevokeDialog] = useState(false)
	const { qrToken: token, isLoading, revoke: _revoke } = useQRToken(tokenId)
	const { events } = useEvents()
	const tokenEvents = events.filter(e => e.token === tokenId)

	if (isLoading) return null

	if (!token) {
		return (
			<>
				<TopBar title="Token non trouvé" />
				<div className="pt-16">
					<div className="p-4 lg:p-6">
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<AlertTriangle className="text-muted-foreground h-12 w-12" />
							<h2 className="mt-4 text-xl font-semibold">Token non trouvé</h2>
							<p className="text-muted-foreground mt-2">
								Le QR Token demandé n&apos;existe pas ou a été supprimé.
							</p>
							<Button asChild className="mt-4">
								<Link href="/qr">Retour aux tokens</Link>
							</Button>
						</div>
					</div>
				</div>
			</>
		)
	}

	const qrUrl = `https://retrouveci.com/q/${token.token}`

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text)
		toast.success(`${label} copié`)
	}

	const handleRevoke = async () => {
		await _revoke()
		toast.success(`Token ${token.token} révoqué`)
		setShowRevokeDialog(false)
	}

	return (
		<>
			<TopBar title={`Token ${token.token}`} />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<TokenDetailsCard
								token={token}
								qrUrl={qrUrl}
								onCopy={copyToClipboard}
							/>
							<TokenTimeline token={token} events={tokenEvents} />
						</div>

						<div className="space-y-6">
							<TokenActionsCard
								status={token.status}
								onRevokeClick={() => setShowRevokeDialog(true)}
							/>
						</div>
					</div>
				</div>
			</div>

			<RevokeTokenDialog
				open={showRevokeDialog}
				tokenId={token.token}
				onOpenChange={setShowRevokeDialog}
				onConfirm={handleRevoke}
			/>
		</>
	)
}
