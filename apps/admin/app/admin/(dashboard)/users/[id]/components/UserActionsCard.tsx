import { Button, CardContent, CardHeader, CardTitle } from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { Edit, Ban, ArrowLeft } from 'lucide-react'
import { BentoCard } from '@/components/admin/bento-card'

interface UserActionsCardProps {
	status: string
	onDeactivate: () => void
}

export function UserActionsCard({ status, onDeactivate }: UserActionsCardProps) {
	return (
		<BentoCard variant="content">
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-semibold">Actions rapides</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<Button variant="outline" className="w-full justify-start">
					<Edit className="mr-2 h-4 w-4" />
					Modifier le profil
				</Button>
				<Button
					variant="outline"
					className={`w-full justify-start ${
						status === 'active'
							? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
							: 'text-green-600 hover:bg-green-50 hover:text-green-700'
					}`}
					onClick={onDeactivate}
				>
					<Ban className="mr-2 h-4 w-4" />
					{status === 'active' ? 'Désactiver le compte' : 'Activer le compte'}
				</Button>
				<Button variant="outline" className="w-full justify-start" asChild>
					<Link href="/admin/users">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Retour aux utilisateurs
					</Link>
				</Button>
			</CardContent>
		</BentoCard>
	)
}
