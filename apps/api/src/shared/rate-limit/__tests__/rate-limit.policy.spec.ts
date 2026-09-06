import { describe, expect, it } from 'vitest'
import { limitFor } from '../rate-limit.policy'

describe('limitFor', () => {
	describe('the OTP bucket', () => {
		it.each([
			'/api/auth/phone-number/send-otp',
			'/api/auth/phone-number/request-password-reset',
		])('holds %s, which spends an SMS on every hit', path => {
			expect(limitFor('POST', path)).toEqual({
				bucket: 'otp',
				max: 5,
				windowSeconds: 900,
			})
		})

		it('is not escaped by a query string or a trailing slash', () => {
			const rule = limitFor('POST', '/api/auth/phone-number/send-otp/?a=1')

			expect(rule?.bucket).toBe('otp')
		})
	})

	describe('the auth bucket', () => {
		it.each([
			'/api/auth/sign-in/phone-number',
			'/api/auth/phone-number/verify',
			'/api/auth/phone-number/reset-password',
			'/api/admin-auth/sign-in/email',
			'/api/admin-auth/reset-password',
			'/api/admin-auth/admin/create-user',
		])('holds %s', path => {
			expect(limitFor('POST', path)).toEqual({
				bucket: 'auth',
				max: 10,
				windowSeconds: 900,
			})
		})
	})

	describe('the public-write bucket', () => {
		it.each([
			'/contact-messages',
			'/qr-codes/RCI-123456/contact',
			'/qr-codes/RCI-123456/reach',
			'/lost-items/clx0000000000/contact',
		])('holds %s, which anyone may post without an account', path => {
			expect(limitFor('POST', path)).toEqual({
				bucket: 'public-write',
				max: 10,
				windowSeconds: 3600,
			})
		})

		it('does not spread to a sibling write on the same resource', () => {
			expect(limitFor('POST', '/qr-codes/RCI-123456/activate')).toBeNull()
			expect(limitFor('PATCH', '/lost-items/clx0000000000')).toBeNull()
		})
	})

	describe('the public-read bucket', () => {
		it.each(['GET', 'HEAD'])('holds the scan read on a %s', method => {
			expect(limitFor(method, '/qr-codes/RCI-123456/scan')).toEqual({
				bucket: 'public-read',
				max: 60,
				windowSeconds: 900,
			})
		})

		// `get-session` runs on every navigation: a cap there signs everyone out.
		// Naming the read paths one by one is what keeps it out.
		it.each(['GET', 'HEAD'])('leaves every other %s read alone', method => {
			expect(limitFor(method, '/api/auth/get-session')).toBeNull()
			expect(limitFor(method, '/lost-items')).toBeNull()
			expect(limitFor(method, '/qr-codes/RCI-123456')).toBeNull()
			expect(limitFor(method, '/qr-codes/mine')).toBeNull()
		})

		// A refused preflight breaks the call it precedes.
		it('never limits an OPTIONS, scan read included', () => {
			expect(limitFor('OPTIONS', '/qr-codes/RCI-123456/scan')).toBeNull()
			expect(limitFor('OPTIONS', '/qr-codes/RCI-123456/reach')).toBeNull()
		})
	})

	it('leaves everything outside the three buckets alone', () => {
		expect(limitFor('POST', '/uploads/lost-item-photo')).toBeNull()
		expect(limitFor('POST', '/sticker-orders')).toBeNull()
		expect(limitFor('POST', '/lost-items')).toBeNull()
	})
})
