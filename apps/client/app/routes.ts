import { type RouteConfig, route, index, layout } from '@react-router/dev/routes'

export default [
	layout('routes/app-layout.tsx', [
		index('routes/home.tsx'),
		route('about', 'routes/about.tsx'),
		route('contact', 'routes/contact.tsx'),
		route('download', 'routes/download.tsx'),
		route('terms', 'routes/terms.tsx'),
		route('privacy', 'routes/privacy.tsx'),
		route('publish', 'routes/publish.tsx'),
		route('publish/lost', 'routes/publish-lost.tsx'),
		route('publish/found', 'routes/publish-found.tsx'),
		route('stickers', 'routes/stickers.tsx'),
		route('stickers/order', 'routes/stickers-order.tsx'),
		route('posts', 'routes/posts.tsx'),
		route('posts/:id', 'routes/posts-detail.tsx'),
		route('account', 'routes/account.tsx'),
		route('account/posts', 'routes/account-posts.tsx'),
		route('account/orders', 'routes/account-orders.tsx'),
		route('account/stickers', 'routes/account-stickers.tsx'),
		route('account/settings', 'routes/account-settings.tsx'),
	]),
	route('auth', 'routes/auth-layout.tsx', [
		index('routes/auth-index.tsx'),
		route('login', 'routes/auth-login.tsx'),
		route('register', 'routes/auth-register.tsx'),
		route('password-forgotten', 'routes/auth-password-forgotten.tsx'),
		route('reset-password', 'routes/auth-reset-password.tsx'),
	]),
	route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
