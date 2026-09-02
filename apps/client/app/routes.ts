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
		// Download page on stand-by: there is no mobile app to download yet.
		// route('download', 'routes/download/_index.tsx'),
		route('terms', 'routes/terms/_index.tsx'),
		route('privacy', 'routes/privacy/_index.tsx'),
		route('publish', 'routes/publish/_index.tsx'),
		route('stickers', 'routes/stickers/_index.tsx'),
		route('stickers/order', 'routes/stickers/order/_index.tsx'),
		route('posts', 'routes/posts/_index.tsx'),
		// In the shell: the primer and the code entry are ordinary page content,
		// and only the live viewfinder goes full-bleed, over the tab bar.
		route('scan', 'routes/scan/_index.tsx'),
		// Asked once per code read, not per navigation: a scan has to know
		// whether the sticker is still waiting before it decides where to go.
		route('scan/status', 'routes/scan/servers/sticker-status.loader.ts'),
		route('posts/:id', 'routes/posts/details/_index.tsx'),
		route('account', 'routes/account/_index.tsx'),
		route('account/posts', 'routes/account/posts/_index.tsx'),
		route(
			'account/posts/matches',
			'routes/account/posts/servers/matches.loader.ts',
		),
		route('account/posts/:id', 'routes/account/posts/edit/_index.tsx'),
		route('account/orders', 'routes/account/orders/_index.tsx'),
		route('account/stickers', 'routes/account/stickers/_index.tsx'),
		route('account/settings', 'routes/account/settings/_index.tsx'),
		route('notifications', 'routes/notifications/_index.tsx'),
	]),
	route('q/:code', 'routes/q/_index.tsx'),
	// The three-step tunnel carries its own 56 px bar and its own low action bar,
	// so it sits outside the shell: the tab bar and that action bar would
	// otherwise stack at the foot of the screen and steal each other's taps. The
	// chooser above stays in the shell, and stays the entry point.
	route('publish/lost', 'routes/publish/lost/_index.tsx'),
	route('publish/found', 'routes/publish/found/_index.tsx'),
	route('publish/matches', 'routes/publish/servers/matching.loader.ts'),
	layout('routes/auth/layout.tsx', [
		route('login', 'routes/auth/login/_index.tsx'),
		route('register', 'routes/auth/register/_index.tsx'),
		route('password-forgotten', 'routes/auth/password-forgotten/_index.tsx'),
		route('reset-password', 'routes/auth/reset-password/_index.tsx'),
	]),
	route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
