import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthService } from '@thallesp/nestjs-better-auth'
import type { FastifyRequest } from 'fastify'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { AccountController } from '../account.controller'

function buildAuthService() {
	return {
		api: { setPassword: vi.fn() },
	} as unknown as AuthService<Auth>
}

describe('AccountController', () => {
	let authService: AuthService<Auth>
	let controller: AccountController

	beforeEach(() => {
		authService = buildAuthService()
		controller = new AccountController(authService)
	})

	describe('setInitialPassword', () => {
		it('requires a session', () => {
			expect(
				Reflect.getMetadata('PUBLIC', controller.setInitialPassword),
			).toBeUndefined()
		})

		it('forwards the password and the request headers to better-auth', async () => {
			const response = { status: true }
			vi.mocked(authService.api.setPassword).mockResolvedValue(
				response as never,
			)

			const req = {
				headers: { cookie: 'better-auth.session_token=abc' },
			} as unknown as FastifyRequest

			const result = await controller.setInitialPassword(
				{ newPassword: 'Abcdefg1' },
				req,
			)

			expect(authService.api.setPassword).toHaveBeenCalledWith({
				body: { newPassword: 'Abcdefg1' },
				headers: expect.any(Headers),
			})

			const [call] = vi.mocked(authService.api.setPassword).mock.calls
			const forwarded = new Headers(call?.[0]?.headers)
			expect(forwarded.get('cookie')).toBe('better-auth.session_token=abc')
			expect(result).toEqual(response)
		})
	})
})
