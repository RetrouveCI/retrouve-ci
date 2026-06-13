import {
	LostItemCategory as PrismaLostItemCategory,
	LostItemType as PrismaLostItemType,
	ModerationStatus as PrismaModerationStatus,
	ResolutionStatus as PrismaResolutionStatus,
	type LostItem as PrismaLostItem,
} from '@retrouve-ci/database'
import { describe, expect, it } from 'vitest'
import {
	toDomainCategory,
	toDomainLostItem,
	toDomainModerationStatus,
	toDomainResolutionStatus,
	toDomainType,
	toPrismaCategory,
	toPrismaModerationStatus,
	toPrismaResolutionStatus,
	toPrismaType,
} from './lost-item.mapper'

const prismaLostItem: PrismaLostItem = {
	id: 'lost-item-1',
	type: PrismaLostItemType.LOST,
	category: PrismaLostItemCategory.PHONE,
	title: 'iPhone 13 perdu',
	description: 'Perdu près du marché de Cocody',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: new Date('2026-01-01'),
	contactName: 'Jean Dupont',
	contactWhatsapp: '+2250700000000',
	photos: ['photo1.jpg'],
	moderationStatus: PrismaModerationStatus.PENDING,
	resolutionStatus: PrismaResolutionStatus.ACTIVE,
	views: 0,
	contactsCount: 0,
	userId: 'user-1',
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-02'),
}

describe('toDomainLostItem', () => {
	it('maps a Prisma lost item to the domain model', () => {
		expect(toDomainLostItem(prismaLostItem)).toEqual({
			id: 'lost-item-1',
			type: 'lost',
			category: 'phone',
			title: 'iPhone 13 perdu',
			description: 'Perdu près du marché de Cocody',
			ville: 'Abidjan',
			commune: 'Cocody',
			eventDate: new Date('2026-01-01'),
			contactName: 'Jean Dupont',
			contactWhatsapp: '+2250700000000',
			photos: ['photo1.jpg'],
			moderationStatus: 'pending',
			resolutionStatus: 'active',
			views: 0,
			contactsCount: 0,
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			updatedAt: new Date('2026-01-02'),
		})
	})
})

describe('type conversions', () => {
	it('converts between domain and Prisma types', () => {
		expect(toPrismaType('lost')).toBe(PrismaLostItemType.LOST)
		expect(toPrismaType('found')).toBe(PrismaLostItemType.FOUND)
		expect(toDomainType(PrismaLostItemType.LOST)).toBe('lost')
		expect(toDomainType(PrismaLostItemType.FOUND)).toBe('found')
	})
})

describe('category conversions', () => {
	it('converts between domain and Prisma categories', () => {
		expect(toPrismaCategory('phone')).toBe(PrismaLostItemCategory.PHONE)
		expect(toDomainCategory(PrismaLostItemCategory.PHONE)).toBe('phone')
		expect(toPrismaCategory('documents')).toBe(PrismaLostItemCategory.DOCUMENTS)
		expect(toDomainCategory(PrismaLostItemCategory.DOCUMENTS)).toBe('documents')
	})
})

describe('moderation status conversions', () => {
	it('converts between domain and Prisma moderation statuses', () => {
		expect(toPrismaModerationStatus('pending')).toBe(
			PrismaModerationStatus.PENDING,
		)
		expect(toPrismaModerationStatus('published')).toBe(
			PrismaModerationStatus.PUBLISHED,
		)
		expect(toPrismaModerationStatus('hidden')).toBe(
			PrismaModerationStatus.HIDDEN,
		)
		expect(toDomainModerationStatus(PrismaModerationStatus.PENDING)).toBe(
			'pending',
		)
		expect(toDomainModerationStatus(PrismaModerationStatus.PUBLISHED)).toBe(
			'published',
		)
		expect(toDomainModerationStatus(PrismaModerationStatus.HIDDEN)).toBe(
			'hidden',
		)
	})
})

describe('resolution status conversions', () => {
	it('converts between domain and Prisma resolution statuses', () => {
		expect(toPrismaResolutionStatus('active')).toBe(
			PrismaResolutionStatus.ACTIVE,
		)
		expect(toPrismaResolutionStatus('resolved')).toBe(
			PrismaResolutionStatus.RESOLVED,
		)
		expect(toPrismaResolutionStatus('expired')).toBe(
			PrismaResolutionStatus.EXPIRED,
		)
		expect(toDomainResolutionStatus(PrismaResolutionStatus.ACTIVE)).toBe(
			'active',
		)
		expect(toDomainResolutionStatus(PrismaResolutionStatus.RESOLVED)).toBe(
			'resolved',
		)
		expect(toDomainResolutionStatus(PrismaResolutionStatus.EXPIRED)).toBe(
			'expired',
		)
	})
})
