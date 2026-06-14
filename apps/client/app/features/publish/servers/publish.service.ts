class PublishService {
	async create(): Promise<void> {
		await new Promise(r => setTimeout(r, 1500))
	}
}

export const publishService = new PublishService()
