import { describe, expect, it } from 'vitest'
import {
	compareHolderNames,
	normalizeDocumentNumber,
	normalizeHolderName,
	sameDocumentNumber,
} from '../normalize-document'

describe('normalizeDocumentNumber', () => {
	it('reads one licence out of the two ways it is written', () => {
		expect(normalizeDocumentNumber('5811403-13-0015703713RC')).toBe(
			normalizeDocumentNumber('581140313 0015703713 RC'),
		)
	})

	it('lifts the case and answers empty for nothing', () => {
		expect(normalizeDocumentNumber('ci00 12345-678')).toBe('CI0012345678')
		expect(normalizeDocumentNumber(null)).toBe('')
		expect(normalizeDocumentNumber('   ')).toBe('')
	})
})

describe('normalizeHolderName', () => {
	it('drops the accents a card never prints', () => {
		expect(normalizeHolderName('Aïcha Koné')).toEqual(['AICHA', 'KONE'])
	})

	it('answers the same set whichever order the two fields came in', () => {
		expect(normalizeHolderName('KOUASSI Jean')).toEqual(
			normalizeHolderName('Jean Kouassi'),
		)
	})

	it('closes up an apostrophe and opens out a hyphen', () => {
		expect(normalizeHolderName("N'Guessan")).toEqual(['NGUESSAN'])
		expect(normalizeHolderName('Jean-Baptiste')).toEqual(['BAPTISTE', 'JEAN'])
	})

	it('drops a lone initial rather than comparing it', () => {
		expect(normalizeHolderName('KOFFI K. Jean')).toEqual(['JEAN', 'KOFFI'])
	})
})

describe('compareHolderNames', () => {
	it('matches the same holder however the name was typed', () => {
		expect(compareHolderNames('KOUASSI Jean', 'jean kouassi')).toBe('match')
		expect(compareHolderNames('Aïcha KONE', 'AICHA KONE')).toBe('match')
	})

	it('counts a shorter name inside a longer one as the same holder', () => {
		expect(compareHolderNames('KOUASSI Jean', 'KOUASSI Jean Baptiste')).toBe(
			'match',
		)
	})

	it('answers unknown when a side gave no name', () => {
		expect(compareHolderNames(null, 'KOUASSI Jean')).toBe('unknown')
		expect(compareHolderNames('KOUASSI Jean', '')).toBe('unknown')
	})

	/** A shared surname is far too common here to tell two people apart. */
	it('answers unknown on a shared surname and nothing else', () => {
		expect(compareHolderNames('KOUASSI Jean', 'KOUASSI Marie')).toBe('unknown')
	})

	it('answers mismatch when the two names share nothing', () => {
		expect(compareHolderNames('KOUASSI Jean', 'TRAORE Fatou')).toBe('mismatch')
	})
})

describe('sameDocumentNumber', () => {
	it('is true across the two spellings of one number', () => {
		expect(
			sameDocumentNumber('5811403-13-0015703713RC', '581140313 0015703713 RC'),
		).toBe(true)
	})

	it('is false when either side gave none', () => {
		expect(sameDocumentNumber(null, null)).toBe(false)
		expect(sameDocumentNumber('', '')).toBe(false)
		expect(sameDocumentNumber('CI001', null)).toBe(false)
	})
})
