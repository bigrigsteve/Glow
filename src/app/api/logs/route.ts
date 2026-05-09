import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  if (!date) return Response.json({ error: 'date required' }, { status: 400 })

  const userId = session.user.id
  const [pLog, oLog] = await Promise.all([
    prisma.periodLog.findUnique({ where: { userId_date: { userId, date } } }),
    prisma.ovulationLog.findUnique({ where: { userId_date: { userId, date } } }),
  ])

  return Response.json({
    periodLog: pLog
      ? { ...pLog, symptoms: JSON.parse(pLog.symptoms || '[]') }
      : null,
    ovulationLog: oLog ?? null,
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { date, period, ovulation } = await req.json()

  const symptomsJson = JSON.stringify(period.symptoms ?? [])

  const [pLog, oLog] = await Promise.all([
    prisma.periodLog.upsert({
      where: { userId_date: { userId, date } },
      update: { flow: period.flow ?? null, symptoms: symptomsJson, mood: period.mood ?? null, notes: period.notes ?? null },
      create: { userId, date, flow: period.flow ?? null, symptoms: symptomsJson, mood: period.mood ?? null, notes: period.notes ?? null },
    }),
    prisma.ovulationLog.upsert({
      where: { userId_date: { userId, date } },
      update: { lhSurge: !!ovulation.lhSurge, bbt: ovulation.bbt ?? null, cervicalMucus: ovulation.cervicalMucus ?? null, confirmed: !!ovulation.lhSurge },
      create: { userId, date, lhSurge: !!ovulation.lhSurge, bbt: ovulation.bbt ?? null, cervicalMucus: ovulation.cervicalMucus ?? null, confirmed: !!ovulation.lhSurge },
    }),
  ])

  // Auto-update lastPeriodStart in profile when period is logged
  if (period.flow) {
    const profile = await prisma.profile.findUnique({ where: { userId }, select: { lastPeriodStart: true } })
    const isNewer = !profile?.lastPeriodStart || date > profile.lastPeriodStart
    if (isNewer) {
      await prisma.profile.upsert({
        where: { userId },
        update: { lastPeriodStart: date },
        create: { userId, lastPeriodStart: date },
      })
    }
  }

  return Response.json({
    periodLog: { ...pLog, symptoms: JSON.parse(pLog.symptoms) },
    ovulationLog: oLog,
  })
}
