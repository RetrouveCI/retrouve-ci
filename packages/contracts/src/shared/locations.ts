import { z } from 'zod'

/**
 * Where a listing can be placed. One list for both front-ends: the public form
 * and the backoffice's team publication offer the same cities and communes, so
 * a listing filed at the desk matches the ones visitors file.
 */
export const CI_VILLES: readonly string[] = [
	'Abidjan',
	'Bouaké',
	'Daloa',
	'Korhogo',
	'Yamoussoukro',
	'San-Pédro',
	'Man',
	'Divo',
	'Gagnoa',
	'Abengourou',
	'Bondoukou',
	'Agboville',
	'Adzopé',
	'Bingerville',
	'Soubré',
	'Odienné',
	'Séguéla',
	'Touba',
	'Ferkessédougou',
	'Bouaflé',
	'Dimbokro',
	'Lakota',
	'Issia',
	'Tiassalé',
	'Grand-Bassam',
	'Jacqueville',
	'Tabou',
]

/** The one city the commune list belongs to. */
export const COMMUNE_CITY = 'Abidjan'

export const ABIDJAN_COMMUNES: readonly string[] = [
	'Abobo',
	'Adjamé',
	'Attécoubé',
	'Cocody',
	'Koumassi',
	'Marcory',
	'Plateau',
	'Port-Bouët',
	'Riviera',
	'Treichville',
	'Yopougon',
]

/**
 * The assistant may **name** a place, never invent one: what the model answers
 * is narrowed through these before it reaches a filter. The ordinary list
 * filter stays a free string — a visitor typing a hamlet gets no result, where
 * a model naming Paris would send the search somewhere the app does not go.
 */
export const villeSchema = z
	.string()
	.trim()
	.refine(value => CI_VILLES.includes(value), { error: 'Ville inconnue' })

export const abidjanCommuneSchema = z
	.string()
	.trim()
	.refine(value => ABIDJAN_COMMUNES.includes(value), {
		error: 'Commune inconnue',
	})
