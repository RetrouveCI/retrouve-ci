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
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, Lock, Mail } from 'lucide-react'
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

	useEffect(() => {
		if (!authLoading && user) {
			router.replace('/')
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

	if (authLoading) {
		return (
			<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
		)
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
							<div className="flex justify-end">
								<Link
									href="/auth/forgot-password"
									className="text-muted-foreground hover:text-foreground text-xs transition-colors"
								>
									Mot de passe oublié ?
								</Link>
							</div>
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
	)
}
