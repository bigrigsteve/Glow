import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [cycles, logs, profile] = await Promise.all([
    prisma.cycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: 12,
    }),
    prisma.periodLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 90,
    }),
    prisma.profile.findUnique({ where: { userId } }),
  ])

  const parsedLogs = logs.map((l) => ({
    ...l,
    symptoms: JSON.parse(l.symptoms || '[]') as string[],
  }))

  return Response.json({
    cycles,
    logs: parsedLogs,
    profile: profile
      ? {
          averageCycleLength: profile.averageCycleLength,
          averagePeriodLength: profile.averagePeriodLength,
          lastPeriodStart: profile.lastPeriodStart,
          tryingToConceive: profile.tryingToConceive,
        }
      : null,
  })
}
