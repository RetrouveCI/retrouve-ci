export type EventType =
	| 'scan'
	| 'contact'
	| 'activation'
	| 'generation'
	| 'revocation'
export type EventSource = 'Mobile Web' | 'WhatsApp' | 'Admin' | 'API'

export interface Event {
	id: number
	type: EventType
	token: string | null
	user: string
	timestamp: string
	source: EventSource
	metadata?: {
		location?: string
		postId?: number
	}
}

export type ActivityType = 'scan' | 'user' | 'post' | 'contact'

export interface Activity {
	id: number
	icon: string
	text: string
	timestamp: string
	type: ActivityType
}
