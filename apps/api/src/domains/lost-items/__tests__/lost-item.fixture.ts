import { vi } from 'vitest'
import type { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'

export function buildLostItem(overrides: Partial<LostItem> = {}): LostItem {
	return {
		id: 'lost-item-1',
		type: 'lost',
		category: 'phone',
		title: 'iPhone 13 perdu',
		description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: new Date('2026-01-01'),
		contactName: 'Jean Dupont',
		contactWhatsapp: '+2250700000000',
		photos: [],
		moderationStatus: 'published',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		...overrides,
	}
}

/** The repository is a concrete class, so a double is a partial cast. */
export function buildRepository(): LostItemRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		findMatchCandidates: vi.fn(),
		update: vi.fn(),
		updateModerationStatus: vi.fn(),
		delete: vi.fn(),
		incrementViews: vi.fn(),
		incrementContacts: vi.fn(),
	} as unknown as LostItemRepository
}
