import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructure/database/prisma.service'
import type { DashboardStats, StatValue } from '../models/dashboard-stats.model'
import type { ReportingRepository } from './reporting.repository'

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

@Injectable()
export class ReportingRepositoryService implements ReportingRepository {
	constructor(private readonly prisma: PrismaService) {}

	async getDashboardStats(): Promise<DashboardStats> {
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
			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM qr_token
			`,

			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "activatedAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "activatedAt" >= NOW() - INTERVAL '60 days' AND "activatedAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "activatedAt" >= NOW() - INTERVAL '60 days' AND "activatedAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM qr_token
				WHERE status = 'ACTIVATED'
			`,

			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM contact_message
				WHERE "qrTokenCode" IS NOT NULL
			`,

			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM contact_message
			`,

			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM lost_item
				WHERE type = 'LOST'
			`,

			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM lost_item
				WHERE type = 'FOUND'
			`,

			this.prisma.$queryRaw<StatRow[]>`
				SELECT
					COUNT(*)::int AS value,
					COALESCE(
						ROUND((
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '30 days')::numeric
							- COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric
						) / NULLIF(
							COUNT(*) FILTER (WHERE "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days')::numeric,
							0
						) * 100)::int,
					0) AS change
				FROM "user"
			`,

			this.prisma.$queryRaw<ActivityChartRow[]>`
				WITH days AS (
					SELECT generate_series(
						DATE_TRUNC('day', NOW() - INTERVAL '6 days'),
						DATE_TRUNC('day', NOW()),
						'1 day'::interval
					) AS day
				),
				daily_scans AS (
					SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS cnt
					FROM contact_message
					WHERE "qrTokenCode" IS NOT NULL
						AND "createdAt" >= NOW() - INTERVAL '7 days'
					GROUP BY 1
				),
				daily_activations AS (
					SELECT DATE_TRUNC('day', "activatedAt") AS day, COUNT(*) AS cnt
					FROM qr_token
					WHERE "activatedAt" IS NOT NULL
						AND "activatedAt" >= NOW() - INTERVAL '7 days'
					GROUP BY 1
				)
				SELECT
					TO_CHAR(d.day, 'DD Mon') AS date,
					COALESCE(s.cnt, 0)::int AS scans,
					COALESCE(a.cnt, 0)::int AS activations
				FROM days d
				LEFT JOIN daily_scans s ON s.day = d.day
				LEFT JOIN daily_activations a ON a.day = d.day
				ORDER BY d.day
			`,

			this.prisma.$queryRaw<CategoryChartRow[]>`
				SELECT
					category::text,
					COUNT(*) FILTER (WHERE type = 'LOST')::int AS lost,
					COUNT(*) FILTER (WHERE type = 'FOUND')::int AS found
				FROM lost_item
				GROUP BY category
				ORDER BY (
					COUNT(*) FILTER (WHERE type = 'LOST') +
					COUNT(*) FILTER (WHERE type = 'FOUND')
				) DESC
				LIMIT 6
			`,

			this.prisma.$queryRaw<RecentActivityRow[]>`
				WITH recent_contacts AS (
					SELECT
						id::text,
						'contact' AS type,
						CONCAT(name, ' a contacté via sticker ', "qrTokenCode") AS text,
						"createdAt" AS created_at
					FROM contact_message
					WHERE "qrTokenCode" IS NOT NULL
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
					ORDER BY "createdAt" DESC
					LIMIT 3
				)
				SELECT * FROM recent_contacts
				UNION ALL
				SELECT * FROM recent_posts
				ORDER BY created_at DESC
				LIMIT 6
			`,
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
			recentActivities: recentActivities.map(r => ({
				id: r.id,
				type: r.type,
				text: r.text,
				createdAt: r.created_at.toISOString(),
			})),
		}
	}
}

function toStatValue(row: StatRow | undefined): StatValue {
	return { value: row?.value ?? 0, change: row?.change ?? 0 }
}
