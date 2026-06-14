import { listingsService } from './lost-items.service'

export async function postsLoader() {
	const listings = await listingsService.getAll()
	return { listings }
}
