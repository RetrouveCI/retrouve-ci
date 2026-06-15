import { type RouteConfig, route } from '@react-router/dev/routes'

export default [
	route('auth', 'features/auth/layout.tsx', [
		route('login', 'features/auth/login/index.tsx'),
		route('forgot-password', 'features/auth/forgot-password/index.tsx'),
		route('reset-password', 'features/auth/reset-password/index.tsx'),
	]),
] satisfies RouteConfig
