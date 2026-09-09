/** What a row stores, which is the browser's payload flattened. */
export interface PushSubscriptionRecord {
	endpoint: string
	p256dh: string
	auth: string
}

export interface SubscribeToPushInput extends PushSubscriptionRecord {
	userId: string
}

export interface UnsubscribeFromPushInput {
	userId: string
	endpoint: string
}
