import {
	type RouteConfig,
	route,
	index,
	layout,
} from '@react-router/dev/routes'

export default [
	layout('shared/components/dashboard-layout.tsx', [
		index('features/dashboard/index.tsx'),
		route('contact-messages', 'features/contact-messages/index.tsx'),
		route('orders', 'features/orders/index.tsx'),
	]),
	route('auth', 'features/auth/layout.tsx', [
		route('login', 'features/auth/login/index.tsx'),
		route('forgot-password', 'features/auth/forgot-password/index.tsx'),
		route('reset-password', 'features/auth/reset-password/index.tsx'),
	]),
	route('*', 'shared/components/not-found.tsx'),
] satisfies RouteConfig
