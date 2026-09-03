import {
	DocumentType as PrismaDocumentType,
	LostItemCategory as PrismaLostItemCategory,
	LostItemType as PrismaLostItemType,
	ModerationStatus as PrismaModerationStatus,
	ResolutionStatus as PrismaResolutionStatus,
	type LostItem as PrismaLostItem,
} from '@app/database'
import { describe, expect, it } from 'vitest'
import {
	toDomainCategory,
	toDomainDocumentType,
	toDomainLostItem,
	toDomainModerationStatus,
	toDomainResolutionStatus,
	toDomainType,
	toPrismaCategory,
	toPrismaDocumentType,
	toPrismaModerationStatus,
	toPrismaResolutionStatus,
	toPrismaType,
	toPublicLostItem,
} from '../lost-item.mapper'
import { DOCUMENT_TYPES } from '@app/contracts/lost-items'

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
	documentType: null,
	documentHolderName: null,
	documentNumber: null,
	documentIssuer: null,
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
			documentType: null,
			documentHolderName: null,
			documentNumber: null,
			documentIssuer: null,
			moderationStatus: 'pending',
			resolutionStatus: 'active',
			views: 0,
			contactsCount: 0,
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			updatedAt: new Date('2026-01-02'),
		})
	})

	it('maps the document fields of a piece of ID', () => {
		const withDocument = toDomainLostItem({
			...prismaLostItem,
			documentType: PrismaDocumentType.DRIVER_LICENCE,
			documentHolderName: 'KOUASSI Jean',
			documentNumber: '581140313 0015703713 RC',
			documentIssuer: null,
		})

		expect(withDocument.documentType).toBe('driver_licence')
		expect(withDocument.documentHolderName).toBe('KOUASSI Jean')
		expect(withDocument.documentNumber).toBe('581140313 0015703713 RC')
		expect(withDocument.documentIssuer).toBeNull()
	})
})

describe('toPublicLostItem', () => {
	// A listing is an indexable page: a number published beside a name hands
	// over the set an impersonation needs.
	it('drops the document number and keeps everything else', () => {
		const lostItem = toDomainLostItem({
			...prismaLostItem,
			documentType: PrismaDocumentType.NATIONAL_ID,
			documentHolderName: 'KOUASSI Jean',
			documentNumber: 'CI0012345678',
		})

		const projected = toPublicLostItem(lostItem)

		expect(projected).not.toHaveProperty('documentNumber')
		expect(projected.documentHolderName).toBe('KOUASSI Jean')
		expect(projected.documentType).toBe('national_id')
		expect(JSON.stringify(projected)).not.toContain('CI0012345678')
	})
})

describe('document type conversions', () => {
	it('round-trips every document type the contract declares', () => {
		for (const documentType of DOCUMENT_TYPES) {
			expect(toDomainDocumentType(toPrismaDocumentType(documentType))).toBe(
				documentType,
			)
		}
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
