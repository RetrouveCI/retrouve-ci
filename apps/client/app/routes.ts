import { type RouteConfig, route, index, layout } from '@react-router/dev/routes'

export default [
	layout('shared/components/app-layout.tsx', [
		index('features/home/home.tsx'),
		route('about', 'features/marketing/about.tsx'),
		route('contact', 'features/marketing/contact.tsx'),
		route('download', 'features/marketing/download.tsx'),
		route('terms', 'features/marketing/terms.tsx'),
		route('privacy', 'features/marketing/privacy.tsx'),
		route('publish', 'features/marketing/publish.tsx'),
		route('publish/lost', 'features/publish/publish-lost.tsx'),
		route('publish/found', 'features/publish/publish-found.tsx'),
		route('stickers', 'features/marketing/stickers.tsx'),
		route('stickers/order', 'features/stickers-order/stickers-order.tsx'),
		route('posts', 'features/listings/posts.tsx'),
		route('posts/:id', 'features/listings/posts-detail.tsx'),
		route('account', 'features/account/account.tsx'),
		route('account/posts', 'features/account/account-posts.tsx'),
		route('account/orders', 'features/account/account-orders.tsx'),
		route('account/stickers', 'features/account/account-stickers.tsx'),
		route('account/settings', 'features/account/account-settings.tsx'),
	]),
	route('auth', 'features/auth/auth-layout.tsx', [
		index('features/auth/auth-index.tsx'),
		route('login', 'features/auth/auth-login.tsx'),
		route('register', 'features/auth/auth-register.tsx'),
		route('password-forgotten', 'features/auth/auth-password-forgotten.tsx'),
		route('reset-password', 'features/auth/auth-reset-password.tsx'),
	]),
	route('*', 'shared/components/not-found.tsx'),
] satisfies RouteConfig
