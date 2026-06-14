import { listingsService } from '../../servers/lost-items.service'

export async function postsLoader() {
	const listings = await listingsService.getAll()
	return { listings }
}
