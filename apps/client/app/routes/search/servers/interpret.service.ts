import {
	searchInterpretationSchema,
	type SearchInterpretation,
} from '@app/contracts/search-assistant'
import { apiFetch } from '@/shared/utils/api-fetch'

/**
 * From a `servers/` action only. The `request` is what carries `X-Client-Ip`,
 * and without it the API keys the `assistant` bucket on this container: five
 * phrases a quarter of an hour would then be five for every visitor at once.
 *
 * The answer is parsed through the contract rather than trusted: the API
 * declares no response schema, and this is the one route whose body is written
 * by a model.
 */
export async function interpretSearchPhrase(
	phrase: string,
	request: Request,
): Promise<SearchInterpretation> {
	const body = await apiFetch<unknown>('/search-assistant/interpret', {
		method: 'POST',
		body: JSON.stringify({ phrase }),
		request,
	})

	return searchInterpretationSchema.parse(body)
}
