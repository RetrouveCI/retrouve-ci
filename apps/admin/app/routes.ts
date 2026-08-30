import {
	type RouteConfig,
	route,
	index,
	layout,
} from '@react-router/dev/routes'

export default [
	layout('routes/dashboard/layout.tsx', [
		index('routes/dashboard/home/_index.tsx'),
		route('contact-messages', 'routes/dashboard/contact-messages/_index.tsx'),
		route('orders', 'routes/dashboard/orders/_index.tsx'),
		route('qr', 'routes/dashboard/qr/_index.tsx'),
		route('qr/generate', 'routes/dashboard/qr/generate/_index.tsx'),
		route('qr/:code', 'routes/dashboard/qr/token/_index.tsx'),
		route('events', 'routes/dashboard/events/_index.tsx'),
		route('notifications', 'routes/dashboard/notifications/_index.tsx'),
		route('posts', 'routes/dashboard/posts/_index.tsx'),
		route('users', 'routes/dashboard/users/_index.tsx'),
		route('users/:id', 'routes/dashboard/users/detail/_index.tsx'),
		route('administrators', 'routes/dashboard/administrators/_index.tsx'),
		route('profile', 'routes/dashboard/profile/_index.tsx'),
	]),
	layout('routes/auth/layout.tsx', [
		route('login', 'routes/auth/login/_index.tsx'),
		route('forgot-password', 'routes/auth/forgot-password/_index.tsx'),
		route('reset-password', 'routes/auth/reset-password/_index.tsx'),
	]),
	route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
