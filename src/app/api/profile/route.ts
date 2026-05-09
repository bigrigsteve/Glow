import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  })

  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  return Response.json({
    name: user.name,
    email: user.email,
    dateOfBirth: user.profile?.dateOfBirth ?? null,
    averageCycleLength: user.profile?.averageCycleLength ?? 28,
    averagePeriodLength: user.profile?.averagePeriodLength ?? 5,
    tryingToConceive: user.profile?.tryingToConceive ?? false,
    lastPeriodStart: user.profile?.lastPeriodStart ?? null,
  })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, dateOfBirth, averageCycleLength, averagePeriodLength, tryingToConceive, lastPeriodStart } =
    await req.json()

  await Promise.all([
    prisma.user.update({
      where: { id: session.user.id },
      data: { name: name || null },
    }),
    prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        dateOfBirth: dateOfBirth || null,
        averageCycleLength: Number(averageCycleLength) || 28,
        averagePeriodLength: Number(averagePeriodLength) || 5,
        tryingToConceive: Boolean(tryingToConceive),
        lastPeriodStart: lastPeriodStart || null,
      },
      create: {
        userId: session.user.id,
        dateOfBirth: dateOfBirth || null,
        averageCycleLength: Number(averageCycleLength) || 28,
        averagePeriodLength: Number(averagePeriodLength) || 5,
        tryingToConceive: Boolean(tryingToConceive),
        lastPeriodStart: lastPeriodStart || null,
      },
    }),
  ])

  return Response.json({ ok: true })
}
