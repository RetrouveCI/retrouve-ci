import { Injectable } from '@nestjs/common'
import { Prisma } from '@app/database'
import type { ResolvedPeriod } from '@app/contracts/reporting'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import type { DashboardStats, StatValue } from '../types/dashboard-stats.types'

interface StatRow {
	value: number
	change: number
}

interface ActivityChartRow {
	date: string
	scans: number
	activations: number
}

interface CategoryChartRow {
	category: string
	lost: number
	found: number
}

interface RecentActivityRow {
	id: string
	type: string
	text: string
	created_at: Date
}

/**
 * How many points to draw across the period, whatever its length. A week of
 * days and a year of days are not the same chart; the bucket widens instead.
 */
const CHART_BUCKETS = 7

/**
 * ⚠️ `Prisma.raw` is only ever handed a literal written in this file — a table
 * or a column name — never anything that came in over the wire. Every value
 * that does travels as a parameter through the tagged template.
 */
@Injectable()
export class ReportingRepository {
	constructor(private readonly prisma: PrismaService) {}

	async getDashboardStats(period: ResolvedPeriod): Promise<DashboardStats> {
		const [
			qrGenerated,
			qrActivated,
			scans,
			contacts,
			postsLost,
			postsFound,
			newUsers,
			activityChart,
			categoryChart,
			recentActivities,
		] = await Promise.all([
			this.stat(period, Prisma.sql`FROM qr_token`),
			this.stat(
				period,
				Prisma.sql`FROM qr_token WHERE status = 'ACTIVATED'`,
				'activatedAt',
			),
			this.stat(
				period,
				Prisma.sql`FROM contact_message WHERE "qrTokenCode" IS NOT NULL`,
			),
			this.stat(period, Prisma.sql`FROM contact_message`),
			this.stat(period, Prisma.sql`FROM lost_item WHERE type = 'LOST'`),
			this.stat(period, Prisma.sql`FROM lost_item WHERE type = 'FOUND'`),
			this.stat(period, Prisma.sql`FROM "user"`),
			this.activityChart(period),
			this.categoryChart(period),
			this.recentActivities(period),
		])

		return {
			qrGenerated: toStatValue(qrGenerated[0]),
			qrActivated: toStatValue(qrActivated[0]),
			scans: toStatValue(scans[0]),
			contacts: toStatValue(contacts[0]),
			postsLost: toStatValue(postsLost[0]),
			postsFound: toStatValue(postsFound[0]),
			newUsers: toStatValue(newUsers[0]),
			activityChart,
			categoryChart,
			recentActivities: recentActivities.map(row => ({
				id: row.id,
				type: row.type,
				text: row.text,
				createdAt: row.created_at.toISOString(),
			})),
		}
	}

	/**
	 * One figure and what it moved against. Written once rather than seven
	 * times: the window used to be `INTERVAL '30 days'` copied into every query,
	 * so no two of them could be changed apart — and the headline counted the
	 * whole table while the percentage moved over thirty days, which is what
	 * made a « +8 % » describe nothing the number beside it measured.
	 */
	private stat(
		{ from, to, previousFrom }: ResolvedPeriod,
		source: Prisma.Sql,
		column = 'createdAt',
	) {
		const at = Prisma.raw(`"${column}"`)
		const current = Prisma.sql`COUNT(*) FILTER (WHERE ${at} >= ${from} AND ${at} < ${to})`
		const before = Prisma.sql`COUNT(*) FILTER (WHERE ${at} >= ${previousFrom} AND ${at} < ${from})`

		return this.prisma.$queryRaw<StatRow[]>`
			SELECT
				${current}::int AS value,
				COALESCE(
					ROUND((
						${current}::numeric - ${before}::numeric
					) / NULLIF(${before}::numeric, 0) * 100)::int,
				0) AS change
			${source}
		`
	}

	/** Seven buckets across the period, whatever its length. */
	private activityChart({ from, to }: ResolvedPeriod) {
		return this.prisma.$queryRaw<ActivityChartRow[]>`
			WITH bounds AS (
				SELECT
					${from}::timestamptz AS start_at,
					${to}::timestamptz AS end_at,
					(${to}::timestamptz - ${from}::timestamptz) / ${CHART_BUCKETS} AS width
			),
			buckets AS (
				SELECT
					b.start_at + b.width * g AS bucket_start,
					b.start_at + b.width * (g + 1) AS bucket_end
				FROM bounds b, generate_series(0, ${CHART_BUCKETS - 1}) AS g
			)
			SELECT
				TO_CHAR(k.bucket_start, 'DD Mon') AS date,
				(
					SELECT COUNT(*)::int FROM contact_message c
					WHERE c."qrTokenCode" IS NOT NULL
						AND c."createdAt" >= k.bucket_start
						AND c."createdAt" < k.bucket_end
				) AS scans,
				(
					SELECT COUNT(*)::int FROM qr_token q
					WHERE q."activatedAt" >= k.bucket_start
						AND q."activatedAt" < k.bucket_end
				) AS activations
			FROM buckets k
			ORDER BY k.bucket_start
		`
	}

	private categoryChart({ from, to }: ResolvedPeriod) {
		return this.prisma.$queryRaw<CategoryChartRow[]>`
			SELECT
				category::text,
				COUNT(*) FILTER (WHERE type = 'LOST')::int AS lost,
				COUNT(*) FILTER (WHERE type = 'FOUND')::int AS found
			FROM lost_item
			WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
			GROUP BY category
			ORDER BY (
				COUNT(*) FILTER (WHERE type = 'LOST') +
				COUNT(*) FILTER (WHERE type = 'FOUND')
			) DESC
			LIMIT 6
		`
	}

	private recentActivities({ from, to }: ResolvedPeriod) {
		return this.prisma.$queryRaw<RecentActivityRow[]>`
			WITH recent_contacts AS (
				SELECT
					id::text,
					'contact' AS type,
					CONCAT(name, ' a contacté via sticker ', "qrTokenCode") AS text,
					"createdAt" AS created_at
				FROM contact_message
				WHERE "qrTokenCode" IS NOT NULL
					AND "createdAt" >= ${from} AND "createdAt" < ${to}
				ORDER BY "createdAt" DESC
				LIMIT 3
			),
			recent_posts AS (
				SELECT
					id::text,
					'post' AS type,
					CONCAT('Annonce "', title, '" publiée') AS text,
					"createdAt" AS created_at
				FROM lost_item
				WHERE "createdAt" >= ${from} AND "createdAt" < ${to}
				ORDER BY "createdAt" DESC
				LIMIT 3
			)
			SELECT * FROM recent_contacts
			UNION ALL
			SELECT * FROM recent_posts
			ORDER BY created_at DESC
			LIMIT 6
		`
	}
}

function toStatValue(row: StatRow | undefined): StatValue {
	return { value: row?.value ?? 0, change: row?.change ?? 0 }
}
