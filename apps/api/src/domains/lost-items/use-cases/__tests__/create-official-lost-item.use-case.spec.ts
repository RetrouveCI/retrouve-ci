import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SystemAccountService } from '@/infrastructures/auth/system-account.service'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { buildLostItem } from '../../__tests__/lost-item.fixture'
import { CreateOfficialLostItemUseCase } from '../create-official-lost-item.use-case'
import type { CreateOfficialLostItemInput } from '../create-official-lost-item.use-case'

const input: CreateOfficialLostItemInput = {
	type: 'found',
	category: 'documents',
	title: "Carte nationale d'identité au nom de Konan Aya",
	description: 'Déposée au bureau par un chauffeur de taxi communal.',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: new Date('2026-09-06'),
	contactName: 'Équipe RetrouveCI',
	contactWhatsapp: '+2250758412209',
	documentType: 'national_id',
	documentHolderName: 'Konan Aya',
	postedFor: 'Koffi Yao',
}

describe('CreateOfficialLostItemUseCase', () => {
	let repository: LostItemRepository
	let systemAccount: SystemAccountService
	let useCase: CreateOfficialLostItemUseCase

	beforeEach(() => {
		repository = {
			createOfficial: vi.fn().mockResolvedValue(buildLostItem()),
		} as unknown as LostItemRepository
		systemAccount = {
			requireId: vi.fn().mockResolvedValue('system-account-1'),
		} as unknown as SystemAccountService
		useCase = new CreateOfficialLostItemUseCase(repository, systemAccount)
	})

	// The three things the body may not decide. It fills a listing in; it does
	// not choose to skip moderation, nor whom the listing belongs to.
	it('stamps the owner, the badge and the published status', async () => {
		await useCase.execute(input)

		expect(repository.createOfficial).toHaveBeenCalledWith({
			...input,
			userId: 'system-account-1',
			official: true,
			moderationStatus: 'published',
		})
	})

	// A forged body must not choose the owner: the spread puts the stamp last,
	// and this is what holds that order if someone ever reverses it.
	it('overrides an owner the body tried to name', async () => {
		await useCase.execute({
			...input,
			userId: 'attacker-1',
			official: false,
		} as unknown as CreateOfficialLostItemInput)

		expect(repository.createOfficial).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 'system-account-1', official: true }),
		)
	})

	// The desk would be telling itself about its own work.
	it('raises no notification at all', async () => {
		// The use-case takes no notification dependency: its constructor has two
		// arguments, and neither can notify. Asserted as a property so a producer
		// added later has to justify itself here.
		expect(CreateOfficialLostItemUseCase.length).toBe(2)
	})

	it('writes nothing when the system account is missing', async () => {
		vi.mocked(systemAccount.requireId).mockRejectedValue(
			new Error('SystemAccountMissingError'),
		)

		await expect(useCase.execute(input)).rejects.toThrow()
		expect(repository.createOfficial).not.toHaveBeenCalled()
	})

	it('returns the created listing', async () => {
		const created = buildLostItem({ official: true })
		vi.mocked(repository.createOfficial).mockResolvedValue(created)

		expect(await useCase.execute(input)).toEqual(created)
	})
})
