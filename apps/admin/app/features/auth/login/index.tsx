import { redirect } from 'react-router'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components'
import { getServerSession } from '@/shared/auth/auth.server'
import { LoginForm } from './components/login-form'

export async function loader({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (session?.user?.role === 'admin') throw redirect('/')
	return null
}

export default function LoginPage() {
	return (
		<Card className="w-full max-w-md border-0 shadow-2xl">
			<CardHeader className="pt-8 pb-8 text-center">
				<div className="mb-6 flex justify-center">
					<img
						src="/logo.png"
						alt="RetrouveCI"
						width={64}
						height={64}
						className="rounded-2xl shadow-lg"
					/>
				</div>
				<CardTitle className="text-2xl font-bold">RetrouveCI Admin</CardTitle>
				<CardDescription className="text-base">
					Connectez-vous pour accéder au backoffice
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-8">
				<LoginForm />
			</CardContent>
		</Card>
	)
}
