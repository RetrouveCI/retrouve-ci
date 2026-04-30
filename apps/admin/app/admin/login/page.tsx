'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@retrouve-ci/ui/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@retrouve-ci/ui/components/ui/card'
import { Input } from '@retrouve-ci/ui/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@retrouve-ci/ui/components/ui/field'
import { Loader2, QrCode, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
	email: z.string().email('Email invalide'),
	password: z.string().min(1, 'Mot de passe requis'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
	const { login, user, isLoading: authLoading } = useAuth()
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Redirect if already authenticated
	useEffect(() => {
		if (!authLoading && user) {
			router.replace('/admin')
		}
	}, [user, authLoading, router])

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: LoginFormData) => {
		setIsSubmitting(true)

		const success = await login(data.email, data.password)

		if (success) {
			toast.success('Connexion reussie')
			router.push('/admin')
		} else {
			toast.error('Email ou mot de passe incorrect')
		}

		setIsSubmitting(false)
	}

	// Show loading while checking auth
	if (authLoading) {
		return (
			<div className="from-primary/5 via-background to-accent/5 flex min-h-screen items-center justify-center bg-gradient-to-br">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
			</div>
		)
	}

	return (
		<div className="from-primary/5 via-background to-accent/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
			{/* Background decoration */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
				<div className="bg-accent/10 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />
			</div>

			<Card className="w-full max-w-md border-0 shadow-2xl">
				<CardHeader className="pt-8 pb-8 text-center">
					<div className="mb-6 flex justify-center">
						<div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
							<QrCode className="h-8 w-8" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold">RetrouveCI Admin</CardTitle>
					<CardDescription className="text-base">
						Connectez-vous pour acceder au backoffice
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
									/>
								</div>
								{errors.email && (
									<p className="text-destructive mt-1 text-sm">
										{errors.email.message}
									</p>
								)}
							</Field>

							<Field>
								<FieldLabel htmlFor="password" className="text-sm font-medium">
									Mot de passe
								</FieldLabel>
								<div className="relative">
									<Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
									<Input
										id="password"
										type="password"
										placeholder="Entrez votre mot de passe"
										className="h-11 rounded-xl pl-10"
										{...register('password')}
										disabled={isSubmitting}
									/>
								</div>
								{errors.password && (
									<p className="text-destructive mt-1 text-sm">
										{errors.password.message}
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
									Connexion...
								</>
							) : (
								'Se connecter'
							)}
						</Button>

						<div className="text-muted-foreground bg-muted/50 border-border/50 mt-6 rounded-xl border p-4 text-center text-sm">
							<p className="text-foreground mb-2 font-semibold">
								Identifiants de demonstration
							</p>
							<div className="space-y-1">
								<p>
									Email:{' '}
									<span className="text-primary font-mono">
										admin@retrouveci.com
									</span>
								</p>
								<p>
									Mot de passe:{' '}
									<span className="text-primary font-mono">admin123</span>
								</p>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
