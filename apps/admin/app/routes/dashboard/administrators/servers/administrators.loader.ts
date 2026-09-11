import { redirect } from 'react-router'
import { requireAdminSession } from '@/shared/helpers/session.server'
import {
	pastLastPage,
	readListPage,
	readSearch,
} from '@/shared/helpers/list-params'
import { listAdminUsers } from './administrators.service'

export async function administratorsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const search = readSearch(url.searchParams)
	const listPage = readListPage(url.searchParams)

	const { admins, total } = await listAdminUsers(
		{ ...listPage, search },
		request,
	)

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return { admins, total, ...listPage, search }
}
