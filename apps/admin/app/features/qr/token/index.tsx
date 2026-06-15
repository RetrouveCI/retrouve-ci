import { useEffect, useState } from 'react'
import { Link, useFetcher } from 'react-router'
import { Button } from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { TokenDetailsCard } from './components/token-details-card'
import { TokenTimeline } from './components/token-timeline'
import { TokenActionsCard } from './components/token-actions-card'
import { RevokeTokenDialog } from './components/revoke-token-dialog'
import { qrTokenLoader } from './servers/qr-token.loader'
import { qrTokenAction } from './servers/qr-token.action'
import type { QrToken } from '../qr.types'
import type { Route } from './+types/index'

export const loader = qrTokenLoader
export const action = qrTokenAction

interface ActionResult {
	ok: boolean
	token?: QrToken
	error?: string
}

export default function QrTokenDetailPage({
	loaderData,
}: Route.ComponentProps) {
	const [token, setToken] = useState(loaderData.token)
	const [showRevokeDialog, setShowRevokeDialog] = useState(false)

	const fetcher = useFetcher<ActionResult>()
	const isRevoking = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state !== 'idle' || !fetcher.data) return
		if (fetcher.data.ok && fetcher.data.token) {
			setToken(fetcher.data.token)
			setShowRevokeDialog(false)
			toast.success(`Token ${fetcher.data.token.code} révoqué`)
		} else if (!fetcher.data.ok) {
			setShowRevokeDialog(false)
			toast.error(fetcher.data.error ?? 'Impossible de révoquer ce token')
		}
	}, [fetcher.state, fetcher.data])

	const handleRevoke = () => {
		fetcher.submit({ intent: 'revoke' }, { method: 'post' })
	}

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text).catch(() => null)
		toast.success(`${label} copié`)
	}

	const qrUrl = `${import.meta.env.VITE_API_URL?.replace(':3002', ':3000') ?? 'https://retrouveci.com'}/q/${token.code}`

	return (
		<>
			<TopBar title={`Token ${token.code}`} />
			<div className="pt-16">
				<div className="p-4 lg:p-6">
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<TokenDetailsCard
								token={token}
								qrUrl={qrUrl}
								onCopy={copyToClipboard}
							/>
							<TokenTimeline token={token} />
						</div>

						<div className="space-y-6">
							<TokenActionsCard
								status={token.status}
								onRevokeClick={() => setShowRevokeDialog(true)}
								isRevoking={isRevoking}
							/>
						</div>
					</div>
				</div>
			</div>

			<RevokeTokenDialog
				open={showRevokeDialog}
				tokenCode={token.code}
				onOpenChange={setShowRevokeDialog}
				onConfirm={handleRevoke}
			/>
		</>
	)
}

export function ErrorBoundary() {
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
							<Link to="/qr">Retour aux tokens</Link>
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}
