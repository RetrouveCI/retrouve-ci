import { z } from 'zod'

export const eventSchema = z.object({
	title: z.string().min(3, 'Minimum 3 caractères').max(120),
	description: z.string().min(10, 'Minimum 10 caractères').max(2000),
	location: z.string().min(2, 'Requis').max(200),
	ville: z.string().min(2, 'Requis').max(120),
	commune: z.string().max(120).optional(),
	eventDate: z.string().min(1, 'La date est requise'),
})

export const updateStatusSchema = z.object({
	status: z.enum(['draft', 'published', 'cancelled']),
})
