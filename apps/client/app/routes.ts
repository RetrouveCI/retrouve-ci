import {
	type RouteConfig,
	route,
	index,
	layout,
} from '@react-router/dev/routes'

export default [
	layout('routes/layout.tsx', [
		index('routes/home/_index.tsx'),
		route('about', 'routes/about/_index.tsx'),
		route('contact', 'routes/contact/_index.tsx'),
		// Stickers on stand-by until we have a reliable printer/logistics partner
		// (kept intact, unmounted for now — see routes/download, routes/stickers).
		// route('download', 'routes/download/_index.tsx'),
		route('terms', 'routes/terms/_index.tsx'),
		route('privacy', 'routes/privacy/_index.tsx'),
		route('publish', 'routes/publish/_index.tsx'),
		route('publish/lost', 'routes/publish/lost/_index.tsx'),
		route('publish/found', 'routes/publish/found/_index.tsx'),
		route('publish/matches', 'routes/publish/servers/matching.loader.ts'),
		route('account/activity', 'routes/account/servers/activity.loader.ts'),
		// route('stickers', 'routes/stickers/_index.tsx'),
		// route('stickers/order', 'routes/stickers/order/_index.tsx'),
		route('posts', 'routes/posts/_index.tsx'),
		route('posts/:id', 'routes/posts/details/_index.tsx'),
		route('account', 'routes/account/_index.tsx'),
		route('account/posts', 'routes/account/posts/_index.tsx'),
		route('account/posts/:id', 'routes/account/posts/edit/_index.tsx'),
		// route('account/orders', 'routes/account/orders/_index.tsx'),
		// route('account/stickers', 'routes/account/stickers/_index.tsx'),
		route('account/settings', 'routes/account/settings/_index.tsx'),
		route('notifications', 'routes/notifications/_index.tsx'),
	]),
	// route('q/:code', 'routes/q/_index.tsx'),
	route('auth', 'routes/auth/layout.tsx', [
		index('routes/auth/_index.tsx'),
		route('login', 'routes/auth/login/_index.tsx'),
		route('register', 'routes/auth/register/_index.tsx'),
		route('password-forgotten', 'routes/auth/password-forgotten/_index.tsx'),
		route('reset-password', 'routes/auth/reset-password/_index.tsx'),
	]),
	route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
