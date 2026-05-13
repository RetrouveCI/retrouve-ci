'use client'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, FieldGroup, Field, FieldLabel } from '@retrouve-ci/ui/components'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/admin/topbar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const generateSchema = z.object({
	quantity: z.string().min(1, 'La quantité est requise'),
	batchName: z.string().min(1, 'Le nom du batch est requis'),
	exportCSV: z.boolean(),
	exportImages: z.boolean(),
	exportPDF: z.boolean(),
})

type GenerateFormData = z.infer<typeof generateSchema>

export default function GenerateQRPage() {
	const router = useRouter()
	const [isGenerating, setIsGenerating] = useState(false)

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<GenerateFormData>({
		resolver: zodResolver(generateSchema),
		defaultValues: {
			quantity: '100',
			batchName: '',
			exportCSV: true,
			exportImages: false,
			exportPDF: false,
		},
	})

	const onSubmit = async (data: GenerateFormData) => {
		setIsGenerating(true)

		// Simulate generation delay
		await new Promise(resolve => setTimeout(resolve, 2000))

		if (data.exportCSV) {
			const headers = ['Token', 'URL', 'Batch', 'Created']
			const now = new Date().toISOString()
			const rows = Array.from({ length: parseInt(data.quantity) }, (_, i) => {
				const token = `RCI-${Math.random().toString(36).substring(2, 6).toUpperCase()}${i}`
				return [token, `https://retrouveci.com/q/${token}`, data.batchName, now]
			})

			const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
			const blob = new Blob([csv], { type: 'text/csv' })
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${data.batchName}.csv`
			a.click()
			URL.revokeObjectURL(url)
		}

		setIsGenerating(false)
		toast.success(`${data.quantity} tokens générés avec succès`)
		router.push('/admin/qr')
	}

	const exportCSV = watch('exportCSV')
	const exportImages = watch('exportImages')
	const exportPDF = watch('exportPDF')

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
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="quantity">Quantité</FieldLabel>
										<Select
											value={watch('quantity')}
											onValueChange={value => setValue('quantity', value)}
										>
											<SelectTrigger id="quantity">
												<SelectValue placeholder="Sélectionner une quantité" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="10">10</SelectItem>
												<SelectItem value="25">25</SelectItem>
												<SelectItem value="50">50</SelectItem>
												<SelectItem value="100">100</SelectItem>
												<SelectItem value="250">250</SelectItem>
												<SelectItem value="500">500</SelectItem>
												<SelectItem value="1000">1000</SelectItem>
											</SelectContent>
										</Select>
										{errors.quantity && (
											<p className="text-destructive text-sm">
												{errors.quantity.message}
											</p>
										)}
									</Field>

									<Field>
										<FieldLabel htmlFor="batchName">Nom du Batch</FieldLabel>
										<Input
											id="batchName"
											placeholder="ex: Batch-Juillet-2026"
											{...register('batchName')}
										/>
										<p className="text-muted-foreground text-xs">
											Utilisé pour organiser les tokens
										</p>
										{errors.batchName && (
											<p className="text-destructive text-sm">
												{errors.batchName.message}
											</p>
										)}
									</Field>
								</FieldGroup>

								<div className="space-y-3">
									<p className="text-sm font-medium">Options d&apos;export</p>
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Checkbox
												id="exportCSV"
												checked={exportCSV}
												onCheckedChange={checked =>
													setValue('exportCSV', checked as boolean)
												}
											/>
											<label
												htmlFor="exportCSV"
												className="cursor-pointer text-sm font-medium"
											>
												Fichier CSV (Données brutes)
											</label>
										</div>
										<div className="flex items-center gap-2">
											<Checkbox
												id="exportImages"
												checked={exportImages}
												onCheckedChange={checked =>
													setValue('exportImages', checked as boolean)
												}
											/>
											<label
												htmlFor="exportImages"
												className="cursor-pointer text-sm font-medium"
											>
												Images QR (PNG)
											</label>
										</div>
										<div className="flex items-center gap-2">
											<Checkbox
												id="exportPDF"
												checked={exportPDF}
												onCheckedChange={checked =>
													setValue('exportPDF', checked as boolean)
												}
											/>
											<label
												htmlFor="exportPDF"
												className="cursor-pointer text-sm font-medium"
											>
												Feuille d&apos;impression PDF
											</label>
										</div>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isGenerating}
								>
									{isGenerating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Génération en cours...
										</>
									) : (
										'Générer'
									)}
								</Button>

								<Button variant="ghost" className="w-full" asChild>
									<Link href="/admin/qr">
										<ArrowLeft className="mr-2 h-4 w-4" />
										Retour
									</Link>
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	)
}
