import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ApiError } from '@/shared/lib/api-client'
import type { LostItemType, LostItemCategory } from '@/shared/types/lost-item'
import { createLostItem } from '../servers/publish.service'
import type { CreateLostItemPayload } from '../publish.types'

export interface PublishFormData {
	title: string
	objectType: string
	description: string
	ville: string
	commune: string
	date: string
	name: string
	whatsapp: string
}

export function usePublishForm(type: LostItemType, successMessage: string) {
	const navigate = useNavigate()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [formData, setFormData] = useState<PublishFormData>({
		title: '',
		objectType: '',
		description: '',
		ville: '',
		commune: '',
		date: '',
		name: '',
		whatsapp: '',
	})

	const update = (key: keyof PublishFormData) => (value: string) =>
		setFormData(prev => ({ ...prev, [key]: value }))

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onloadend = () => setImagePreview(reader.result as string)
		reader.readAsDataURL(file)
	}

	const completedFieldCount = [
		formData.title,
		formData.objectType,
		formData.description.length >= 20,
		formData.ville,
		formData.name,
		formData.whatsapp,
	].filter(Boolean).length

	const progress = Math.round((completedFieldCount / 6) * 100)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (
			!formData.title ||
			!formData.objectType ||
			!formData.description ||
			!formData.ville
		) {
			toast.error('Veuillez remplir tous les champs obligatoires')
			return
		}

		if (formData.description.length < 20) {
			toast.error('La description doit contenir au moins 20 caractères')
			return
		}

		setIsSubmitting(true)
		try {
			const payload: CreateLostItemPayload = {
				type,
				category: formData.objectType as LostItemCategory,
				title: formData.title,
				description: formData.description,
				ville: formData.ville,
				commune: formData.commune || undefined,
				eventDate: formData.date
					? new Date(formData.date).toISOString()
					: new Date().toISOString(),
				contactName: formData.name,
				contactWhatsapp: `+225${formData.whatsapp}`,
			}
			const created = await createLostItem(payload)
			toast.success('Annonce publiée !', { description: successMessage })
			navigate(`/posts/${created.id}`)
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				toast.error('Connectez-vous pour publier une annonce.')
				navigate('/auth')
			} else if (err instanceof ApiError) {
				toast.error(err.message)
			} else {
				throw err
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		formData,
		update,
		imagePreview,
		setImagePreview,
		handleImageChange,
		progress,
		isSubmitting,
		handleSubmit,
	}
}
