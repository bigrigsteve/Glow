import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') ?? '')
  const month = parseInt(searchParams.get('month') ?? '') // 0-indexed

  if (isNaN(year) || isNaN(month)) return Response.json({ error: 'year and month required' }, { status: 400 })

  const userId = session.user.id
  const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = new Date(year, month + 1, 0)
  const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  const [pLogs, oLogs, profile] = await Promise.all([
    prisma.periodLog.findMany({
      where: { userId, date: { gte: startStr, lte: endStr } },
      select: { date: true, flow: true },
    }),
    prisma.ovulationLog.findMany({
      where: { userId, date: { gte: startStr, lte: endStr } },
      select: { date: true, confirmed: true, lhSurge: true },
    }),
    prisma.profile.findUnique({ where: { userId } }),
  ])

  return Response.json({
    loggedDays: Object.fromEntries([
      ...pLogs.map((l) => [l.date, { hasFlow: !!l.flow, flow: l.flow }]),
      ...oLogs.map((l) => [l.date, { confirmedOvulation: l.confirmed || l.lhSurge }]),
    ]),
    profile: profile
      ? {
          lastPeriodStart: profile.lastPeriodStart,
          averageCycleLength: profile.averageCycleLength,
          averagePeriodLength: profile.averagePeriodLength,
        }
      : null,
  })
}
