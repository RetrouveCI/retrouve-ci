import { type RouteConfig, route, index, layout } from '@react-router/dev/routes'

export default [
	layout('shared/components/app-layout.tsx', [
		index('features/home/index.tsx'),
		route('about', 'features/about/index.tsx'),
		route('contact', 'features/contact/index.tsx'),
		route('download', 'features/download/index.tsx'),
		route('terms', 'features/terms/index.tsx'),
		route('privacy', 'features/privacy/index.tsx'),
		route('publish', 'features/publish/index.tsx'),
		route('publish/lost', 'features/publish/lost/index.tsx'),
		route('publish/found', 'features/publish/found/index.tsx'),
		route('stickers', 'features/stickers/index.tsx'),
		route('stickers/order', 'features/stickers/order/index.tsx'),
		route('posts', 'features/lost-items/list/index.tsx'),
		route('posts/:id', 'features/lost-items/details/index.tsx'),
		route('account', 'features/account/index.tsx'),
		route('account/posts', 'features/account/posts/index.tsx'),
		route('account/orders', 'features/account/orders/index.tsx'),
		route('account/stickers', 'features/account/stickers/index.tsx'),
		route('account/settings', 'features/account/settings/index.tsx'),
	]),
	route('auth', 'features/auth/layout.tsx', [
		index('features/auth/index.tsx'),
		route('login', 'features/auth/login/index.tsx'),
		route('register', 'features/auth/register/index.tsx'),
		route('password-forgotten', 'features/auth/password-forgotten/index.tsx'),
		route('reset-password', 'features/auth/reset-password/index.tsx'),
	]),
	route('*', 'shared/components/not-found.tsx'),
] satisfies RouteConfig
