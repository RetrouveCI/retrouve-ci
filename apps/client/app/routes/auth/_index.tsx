import { redirect, type LoaderFunctionArgs } from 'react-router'
import { redirectIfAuthenticated } from '@/shared/helpers/session.server'
import { loginUrlWithRedirect } from '@/shared/helpers/redirect'

export async function loader({ request }: LoaderFunctionArgs) {
	await redirectIfAuthenticated(request)
	const url = new URL(request.url)
	return redirect(loginUrlWithRedirect(url.searchParams.get('redirectTo')))
}
