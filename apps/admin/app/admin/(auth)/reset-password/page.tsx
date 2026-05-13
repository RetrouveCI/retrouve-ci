'use client'

import { Suspense, useState } from 'react'
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
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, QrCode, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z
	.object({
		newPassword: z
			.string()
			.min(8, 'Au moins 8 caractères')
			.regex(/[A-Z]/, 'Au moins une majuscule')
			.regex(/[a-z]/, 'Au moins une minuscule')
			.regex(/[0-9]/, 'Au moins un chiffre'),
		confirmPassword: z.string(),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})

type FormData = z.infer<typeof schema>

function ResetPasswordContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const email = searchParams.get('email') ?? ''

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	})

	const onSubmit = async (_data: FormData) => {
		setIsSubmitting(true)
		await new Promise(r => setTimeout(r, 1000))
		setIsSubmitting(false)
		toast.success('Mot de passe réinitialisé !', {
			description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
		})
		router.push('/admin/login')
	}

	return (
		<Card className="w-full max-w-md border-0 shadow-2xl">
			<CardHeader className="pt-8 pb-8 text-center">
				<div className="mb-6 flex justify-center">
					<div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
						<QrCode className="h-8 w-8" />
					</div>
				</div>
				<CardTitle className="text-2xl font-bold">Nouveau mot de passe</CardTitle>
				<CardDescription className="text-base">
					{email ? (
						<>
							Réinitialisation pour{' '}
							<span className="text-foreground font-semibold">{email}</span>
						</>
					) : (
						'Choisissez un mot de passe sécurisé pour votre compte.'
					)}
				</CardDescription>
			</CardHeader>

			<CardContent className="pb-8">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="newPassword" className="text-sm font-medium">
								Nouveau mot de passe
							</FieldLabel>
							<div className="relative">
								<Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									id="newPassword"
									type={showNew ? 'text' : 'password'}
									placeholder="Minimum 8 caractères"
									className="h-11 rounded-xl pl-10 pr-11"
									{...register('newPassword')}
									disabled={isSubmitting}
									autoFocus
								/>
								<button
									type="button"
									onClick={() => setShowNew(v => !v)}
									className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
									tabIndex={-1}
								>
									{showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
							{errors.newPassword && (
								<p className="text-destructive mt-1 text-sm">
									{errors.newPassword.message}
								</p>
							)}
							<p className="text-muted-foreground text-xs">
								Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
							</p>
						</Field>

						<Field>
							<FieldLabel htmlFor="confirmPassword" className="text-sm font-medium">
								Confirmer le mot de passe
							</FieldLabel>
							<div className="relative">
								<Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									id="confirmPassword"
									type={showConfirm ? 'text' : 'password'}
									placeholder="••••••••"
									className="h-11 rounded-xl pl-10 pr-11"
									{...register('confirmPassword')}
									disabled={isSubmitting}
								/>
								<button
									type="button"
									onClick={() => setShowConfirm(v => !v)}
									className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
									tabIndex={-1}
								>
									{showConfirm ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="text-destructive mt-1 text-sm">
									{errors.confirmPassword.message}
								</p>
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
								Réinitialisation...
							</>
						) : (
							'Réinitialiser le mot de passe'
						)}
					</Button>

					<div className="text-center">
						<Link
							href="/admin/login"
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

export default function ResetPasswordPage() {
	return (
		<Suspense>
			<ResetPasswordContent />
		</Suspense>
	)
}
