import type { ArgumentsHost } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { LostItemPhotosRefusedError } from '@/domains/lost-items/errors/lost-item.errors'
import {
	QrTokenAlreadyActivatedError,
	QrTokenNotActivatedError,
	QrTokenNotFoundError,
	QrTokenRevokedError,
} from '@/domains/qr-codes/errors/qr-token.errors'
import { DomainExceptionFilter } from '../domain-exception.filter'

function catchIt(error: Error) {
	const send = vi.fn()
	const status = vi.fn().mockReturnValue({ send })
	const host = {
		switchToHttp: () => ({ getResponse: () => ({ status }) }),
	} as unknown as ArgumentsHost

	new DomainExceptionFilter().catch(error as never, host)

	return {
		status: status.mock.calls[0]?.[0] as number,
		body: send.mock.calls[0]?.[0] as Record<string, unknown>,
	}
}

describe('DomainExceptionFilter', () => {
	// The half of the debt this closes: a domain refusal reached a form as a
	// banner, in a shape `ZodValidationPipe` never used.
	it.each([
		[new LostItemPhotosRefusedError(), 'photos'],
		[new QrTokenAlreadyActivatedError(), 'code'],
		[new QrTokenRevokedError(), 'code'],
	])('names the field %#', (error, field) => {
		const { status, body } = catchIt(error)

		expect(status).toBe(400)
		expect(body['errors']).toEqual({ [field]: [error.message] })
		expect(body['message']).toBe(error.message)
	})

	// A refusal answered to a page with no form has no field to land on.
	it('sends no errors map when the error names no field', () => {
		const { status, body } = catchIt(new QrTokenNotActivatedError())

		expect(status).toBe(400)
		expect(body).not.toHaveProperty('errors')
	})

	it('keeps answering 404 on a not-found', () => {
		expect(catchIt(new QrTokenNotFoundError('RCI-A')).status).toBe(404)
	})

	// French: a visitor reads these two on the activation dialog.
	it.each([
		[new QrTokenAlreadyActivatedError(), 'Ce sticker est déjà activé'],
		[
			new QrTokenRevokedError(),
			'Ce sticker a été désactivé et ne peut plus être activé',
		],
	])('answers %# in French', (error, message) => {
		expect(catchIt(error).body['message']).toBe(message)
	})
})
