'use client'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	FieldGroup,
	Field,
	FieldLabel,
} from '@retrouve-ci/ui/components'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
	email: z.string().email('Email invalide'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: '' },
	})

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		toast.success('Instructions envoyées', {
			description:
				'Si cet email est enregistré, vous recevrez les instructions de réinitialisation.',
		})
		router.push(`/admin/reset-password?email=${encodeURIComponent(data.email)}`)
	}

	return (
		<Card className="w-full max-w-md border-0 shadow-2xl">
			<CardHeader className="pt-8 pb-8 text-center">
				<div className="mb-6 flex justify-center">
					<Image
						src="/logo.png"
						alt="RetrouveCI"
						width={64}
						height={64}
						className="rounded-2xl shadow-lg"
						priority
					/>
				</div>
				<CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
				<CardDescription className="text-base">
					Entrez votre email pour recevoir les instructions de réinitialisation.
				</CardDescription>
			</CardHeader>

			<CardContent className="pb-8">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email" className="text-sm font-medium">
								Email
							</FieldLabel>
							<div className="relative">
								<Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									id="email"
									type="email"
									placeholder="admin@retrouveci.com"
									className="h-11 rounded-xl pl-10"
									{...register('email')}
									disabled={isSubmitting}
									autoFocus
								/>
							</div>
							{errors.email && (
								<p className="text-destructive mt-1 text-sm">{errors.email.message}</p>
							)}
						</Field>
					</FieldGroup>

					<Button
						type="submit"
						className="shadow-primary/25 h-11 w-full rounded-xl text-base font-medium shadow-lg"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Envoi en cours...
							</>
						) : (
							'Envoyer les instructions'
						)}
					</Button>

					<div className="text-center">
						<Link
							href="/auth/login"
							className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
						>
							<ArrowLeft className="h-4 w-4" />
							Retour à la connexion
						</Link>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
