import { redirect } from 'react-router'
import { requireAdminSession } from '@/shared/helpers/session.server'
import {
	pastLastPage,
	readListPage,
	readSearch,
} from '@/shared/helpers/list-params'
import { listUsers } from './users.service'

/**
 * ⚠️ No status axis. better-auth's `list-users` takes **one** filter and it is
 * spent on the role — without it an administrator would appear among the
 * visitors. Filtering banned accounts on the loaded page is what this list used
 * to do, and it is the same trap F9a took the period selector out for: it
 * filters what happens to be loaded and calls it the answer. The status stays
 * on the row; a real filter needs an account route of the API's own.
 */
export async function usersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const search = readSearch(url.searchParams)
	const listPage = readListPage(url.searchParams)

	const { users, total } = await listUsers({ ...listPage, search }, request)

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return { users, total, ...listPage, search }
}
