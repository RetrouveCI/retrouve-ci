import { Link } from 'react-router'
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { TopBar } from '@/shared/components/topbar'
import { ArrowLeft } from 'lucide-react'
import { GenerateQrForm } from './components/generate-qr-form'
import { generateQrAction } from './servers/generate.action'

export const action = generateQrAction

export default function GenerateQrPage() {
	return (
		<>
			<TopBar title="Générer des QR Tokens" />
			<div className="pt-16">
				<div className="flex items-center justify-center p-4 lg:p-6">
					<Card className="w-full max-w-lg">
						<CardHeader>
							<CardTitle>Générer des nouveaux tokens</CardTitle>
							<CardDescription>
								Créez un lot de QR codes uniques pour l&apos;impression.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<GenerateQrForm />
								<Button variant="ghost" className="w-full" asChild>
									<Link to="/qr">
										<ArrowLeft className="mr-2 h-4 w-4" />
										Retour
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	)
}
