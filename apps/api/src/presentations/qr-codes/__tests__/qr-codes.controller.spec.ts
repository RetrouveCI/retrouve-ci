import type { UserSession } from '@thallesp/nestjs-better-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken } from '@/domains/qr-codes/__tests__/qr-token.fixture'
import type { ActivateQrTokenUseCase } from '@/domains/qr-codes/use-cases/activate-qr-token.use-case'
import type { ContactQrTokenOwnerUseCase } from '@/domains/qr-codes/use-cases/contact-qr-token-owner.use-case'
import type { GenerateQrTokensUseCase } from '@/domains/qr-codes/use-cases/generate-qr-tokens.use-case'
import type { GetMyQrTokensUseCase } from '@/domains/qr-codes/use-cases/get-my-qr-tokens.use-case'
import type { GetMyStickerSummaryUseCase } from '@/domains/qr-codes/use-cases/get-my-sticker-summary.use-case'
import type { GetPaginatedQrTokensUseCase } from '@/domains/qr-codes/use-cases/get-paginated-qr-tokens.use-case'
import type { GetQrTokenByCodeUseCase } from '@/domains/qr-codes/use-cases/get-qr-token-by-code.use-case'
import type { GetQrTokenPublicViewUseCase } from '@/domains/qr-codes/use-cases/get-qr-token-public-view.use-case'
import type { RevokeQrTokenUseCase } from '@/domains/qr-codes/use-cases/revoke-qr-token.use-case'
import type { UpdateQrTokenDetailsUseCase } from '@/domains/qr-codes/use-cases/update-qr-token-details.use-case'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { QrCodesController } from '../qr-codes.controller'

const session = { user: { id: 'user-1' } } as UserSession<Auth>

function buildUseCase<TUseCase>(): TUseCase {
	return { execute: vi.fn() } as unknown as TUseCase
}

describe('QrCodesController', () => {
	let generate: GenerateQrTokensUseCase
	let getByCode: GetQrTokenByCodeUseCase
	let getPublicView: GetQrTokenPublicViewUseCase
	let activate: ActivateQrTokenUseCase
	let revoke: RevokeQrTokenUseCase
	let updateDetails: UpdateQrTokenDetailsUseCase
	let getPaginated: GetPaginatedQrTokensUseCase
	let getMine: GetMyQrTokensUseCase
	let getMineSummary: GetMyStickerSummaryUseCase
	let contactOwner: ContactQrTokenOwnerUseCase
	let controller: QrCodesController

	beforeEach(() => {
		generate = buildUseCase<GenerateQrTokensUseCase>()
		getByCode = buildUseCase<GetQrTokenByCodeUseCase>()
		getPublicView = buildUseCase<GetQrTokenPublicViewUseCase>()
		activate = buildUseCase<ActivateQrTokenUseCase>()
		revoke = buildUseCase<RevokeQrTokenUseCase>()
		updateDetails = buildUseCase<UpdateQrTokenDetailsUseCase>()
		getPaginated = buildUseCase<GetPaginatedQrTokensUseCase>()
		getMine = buildUseCase<GetMyQrTokensUseCase>()
		getMineSummary = buildUseCase<GetMyStickerSummaryUseCase>()
		contactOwner = buildUseCase<ContactQrTokenOwnerUseCase>()
		controller = new QrCodesController(
			generate,
			getByCode,
			getPublicView,
			activate,
			revoke,
			updateDetails,
			getPaginated,
			getMine,
			getMineSummary,
			contactOwner,
		)
	})

	describe('generate', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.generate)).toEqual([
				'admin',
			])
		})

		it('delegates to the use-case', async () => {
			const created = [buildQrToken()]
			vi.mocked(generate.execute).mockResolvedValue(created)

			expect(await controller.generate({ count: 1 })).toEqual(created)
			expect(generate.execute).toHaveBeenCalledWith({ count: 1 })
		})
	})

	describe('list', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.list)).toEqual(['admin'])
		})
	})

	describe('getOne', () => {
		// It answers the whole token, owner id included; `/:code/scan` is the
		// finder's view. Holding a code must not read the account behind it.
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.getOne)).toEqual(['admin'])
		})

		it('delegates to the use-case', async () => {
			const token = buildQrToken()
			vi.mocked(getByCode.execute).mockResolvedValue(token)

			expect(await controller.getOne(token.code)).toEqual(token)
			expect(getByCode.execute).toHaveBeenCalledWith(token.code)
		})
	})

	describe('getPublicView', () => {
		it('stays open to anonymous finders', () => {
			expect(
				Reflect.getMetadata('ROLES', controller.getPublicView),
			).toBeUndefined()
		})

		it('delegates to the public-view use-case, never the full one', async () => {
			await controller.getPublicView('RCI-ABC123')

			expect(getPublicView.execute).toHaveBeenCalledWith('RCI-ABC123')
			expect(getByCode.execute).not.toHaveBeenCalled()
		})
	})

	describe('listMine', () => {
		it('passes the session user id alongside the filter', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(getMine.execute).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			await controller.listMine(session, filter)

			expect(getMine.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				filter,
			})
		})
	})

	describe('listMineSummary', () => {
		it('passes the session user id and nothing else', async () => {
			const summary = { delivered: 12, activated: 3, pending: 9 }
			vi.mocked(getMineSummary.execute).mockResolvedValue(summary)

			await expect(controller.listMineSummary(session)).resolves.toEqual(
				summary,
			)
			expect(getMineSummary.execute).toHaveBeenCalledWith('user-1')
		})
	})

	describe('activate', () => {
		it('passes the session user id, never a body one', async () => {
			vi.mocked(activate.execute).mockResolvedValue(buildQrToken())

			await controller.activate(session, 'RCI-ABC123', { label: 'Mes clés' })

			expect(activate.execute).toHaveBeenCalledWith({
				code: 'RCI-ABC123',
				userId: 'user-1',
				data: { label: 'Mes clés' },
			})
		})
	})

	describe('update', () => {
		it('passes the session user id', async () => {
			vi.mocked(updateDetails.execute).mockResolvedValue(buildQrToken())

			await controller.update(session, 'RCI-ABC123', { label: 'X' })

			expect(updateDetails.execute).toHaveBeenCalledWith({
				code: 'RCI-ABC123',
				userId: 'user-1',
				data: { label: 'X' },
			})
		})
	})

	describe('revoke', () => {
		it('passes the session user id', async () => {
			vi.mocked(revoke.execute).mockResolvedValue(buildQrToken())

			await controller.revoke(session, 'RCI-ABC123')

			expect(revoke.execute).toHaveBeenCalledWith({
				code: 'RCI-ABC123',
				userId: 'user-1',
			})
		})
	})

	describe('contactOwner', () => {
		// The rule that used to live here — refusing a token that is not activated
		// — now belongs to ContactQrTokenOwnerUseCase and is asserted there.
		it('is open to an anonymous finder and delegates the whole operation', async () => {
			vi.mocked(contactOwner.execute).mockResolvedValue(undefined)
			const body = {
				name: 'Konan',
				email: 'konan@example.com',
				phone: '+2250700000001',
				message: 'Bonjour, j’ai trouvé votre objet.',
			}

			expect(await controller.contactOwner('RCI-ABC123', body)).toEqual({
				success: true,
			})
			expect(contactOwner.execute).toHaveBeenCalledWith({
				code: 'RCI-ABC123',
				...body,
			})
			expect(Reflect.getMetadata('PUBLIC', controller.contactOwner)).toBe(true)
		})
	})
})
