import { HttpStatus, type ArgumentsHost } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import { describe, expect, it, vi } from 'vitest'
import { AccountBudgetExceededError } from '../account-budget.error'
import { AccountBudgetFilter } from '../account-budget.filter'

function buildHost() {
	const send = vi.fn()
	const header = vi.fn().mockReturnValue({ send })
	const status = vi.fn().mockReturnValue({ header })
	const response = { status } as unknown as FastifyReply
	const host = {
		switchToHttp: () => ({ getResponse: () => response }),
	} as unknown as ArgumentsHost

	return { host, status, header, send }
}

// The hook answers a 429 with `Retry-After`; so must a ceiling inside Nest, or
// a front reads two shapes for one outcome.
describe('AccountBudgetFilter', () => {
	const error = new AccountBudgetExceededError('Trop de photos envoyées.', 900)

	it('answers 429', () => {
		const { host, status } = buildHost()

		new AccountBudgetFilter().catch(error, host)

		expect(status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS)
	})

	it('carries the delay the error came with', () => {
		const { host, header } = buildHost()

		new AccountBudgetFilter().catch(error, host)

		expect(header).toHaveBeenCalledWith('Retry-After', '900')
	})

	it('answers the same body the request hook does', () => {
		const { host, send } = buildHost()

		new AccountBudgetFilter().catch(error, host)

		expect(send).toHaveBeenCalledWith({
			statusCode: 429,
			message: 'Trop de photos envoyées.',
			error: 'Too Many Requests',
		})
	})
})
