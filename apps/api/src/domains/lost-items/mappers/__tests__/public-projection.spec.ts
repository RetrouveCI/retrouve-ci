import { describe, expect, it } from 'vitest'
import { buildLostItem } from '../../__tests__/lost-item.fixture'
import type { LostItem } from '../../types/lost-item.types'
import { toPublicLostItem } from '../lost-item.mapper'

// The guard the debt asked for. The chain: the fixture is typed `LostItem`, so
// the compiler forces a new column into it, and this partition then fails until
// the column is named on one side or the other.
const PUBLIC_FIELDS = [
	'id',
	'type',
	'category',
	'title',
	'description',
	'ville',
	'commune',
	'eventDate',
	'contactName',
	'photos',
	'documentType',
	'documentHolderName',
	'documentIssuer',
	'moderationStatus',
	'resolutionStatus',
	'views',
	'contactsCount',
	'official',
	'createdAt',
	'updatedAt',
] as const

/** Each withheld field with a value distinctive enough to grep the JSON for. */
const WITHHELD = {
	contactWhatsapp: '+2250700000001',
	documentNumber: 'CI-00123456789',
	moderationReason: 'document_number_visible',
	moderationReasonNote: 'La 2e photo montre le numéro.',
	userId: 'owner-correlation-key',
	// A5 counts this in aggregate; no public screen reads one listing's day.
	// A Date, so the greppable form is the one JSON writes.
	resolvedAt: new Date('2019-03-07T11:22:33.000Z'),
	// The desk's note on a team listing: it names a third party who never
	// asked to appear on an indexable page.
	postedFor: 'Konan Aya, venue au bureau',
} satisfies Partial<Record<keyof LostItem, string | Date>>

const withheldFields = Object.keys(WITHHELD) as (keyof typeof WITHHELD)[]

const serialised = (value: string | Date) =>
	value instanceof Date ? value.toISOString() : value

const projected = () =>
	toPublicLostItem(
		buildLostItem({ ...WITHHELD, moderationReason: 'document_number_visible' }),
	)

describe('the public projection', () => {
	it('accounts for every column of the entity, on one side or the other', () => {
		expect([...PUBLIC_FIELDS, ...withheldFields].sort()).toEqual(
			Object.keys(buildLostItem()).sort(),
		)
	})

	it('emits exactly the public set, plus the reachability it answers', () => {
		expect(Object.keys(projected()).sort()).toEqual(
			[...PUBLIC_FIELDS, 'contactReachable'].sort(),
		)
	})

	// On the serialised shape, not the type: a cast walks past the compiler.
	it.each(withheldFields)('never serialises %s', field => {
		const output = projected()

		expect(output).not.toHaveProperty(field)
		expect(JSON.stringify(output)).not.toContain(serialised(WITHHELD[field]))
	})
})
