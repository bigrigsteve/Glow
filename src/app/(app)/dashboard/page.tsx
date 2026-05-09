'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { calculateCyclePredictions, getPhaseInfo, getFertilityScore } from '@/lib/cycle-calculations'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/Logo'
import type { CyclePrediction } from '@/lib/types'
import { Droplets, CalendarHeart, Sparkles, Flower2, ChevronRight, PenLine, AlertCircle } from 'lucide-react'
import { formatShortDate } from '@/lib/utils'

interface ProfileData {
  name: string | null
  lastPeriodStart: string | null
  averageCycleLength: number
  averagePeriodLength: number
  tryingToConceive: boolean
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { window.location.href = '/login'; return }

    fetch('/api/profile')
      .then((r) => r.json())
      .then((prof) => {
        setProfile(prof)
        if (prof.lastPeriodStart) {
          setPrediction(
            calculateCyclePredictions(prof.lastPeriodStart, prof.averageCycleLength, prof.averagePeriodLength)
          )
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Logo size="md" />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const userName = session?.user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{greeting},</p>
          <h1 className="text-2xl font-bold text-gray-900">{userName} ✨</h1>
        </div>
        <div className="text-right text-sm text-gray-400">
          {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Setup prompt */}
      {!profile?.lastPeriodStart && (
        <Card variant="gradient">
          <CardBody className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 opacity-80" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Set up your cycle</h3>
                <p className="text-sm opacity-80 mb-3">
                  Tell us when your last period started so we can track your cycle and predict your fertile window.
                </p>
                <Link href="/profile">
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white border-0 hover:bg-white/30">
                    Set up now <ChevronRight size={14} />
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {prediction && profile && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Card variant="bordered" className="text-center">
              <CardBody className="p-4">
                <Droplets size={18} className="text-rose-500 mx-auto mb-1.5" />
                <div className="text-3xl font-bold text-gray-900">{prediction.currentCycleDay}</div>
                <div className="text-xs text-gray-400 mt-0.5">Cycle day</div>
              </CardBody>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardBody className="p-4">
                <CalendarHeart size={18} className="text-violet-500 mx-auto mb-1.5" />
                <div className="text-3xl font-bold text-gray-900">
                  {Math.max(0, prediction.daysUntilNextPeriod)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Days to period</div>
              </CardBody>
            </Card>

            <Card
              variant="bordered"
              className={`text-center ${prediction.isFertileToday ? 'border-pink-300 bg-pink-50' : ''}`}
            >
              <CardBody className="p-4">
                <Sparkles size={18} className={`mx-auto mb-1.5 ${prediction.isFertileToday ? 'text-pink-500' : 'text-gray-300'}`} />
                <div className={`text-3xl font-bold ${prediction.isFertileToday ? 'text-pink-600' : 'text-gray-900'}`}>
                  {getFertilityScore(prediction.currentCycleDay, profile.averageCycleLength)}
                  <span className="text-base font-normal">%</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Fertility</div>
              </CardBody>
            </Card>
          </div>

          {/* Fertile window banner */}
          {prediction.isFertileToday && (
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-4 text-white flex items-center gap-3">
              <Flower2 size={24} className="shrink-0" />
              <div>
                <div className="font-semibold">
                  {prediction.isOvulationDay ? '🌸 Ovulation Day!' : '✨ Fertile Window'}
                </div>
                <div className="text-sm opacity-85">
                  {prediction.isOvulationDay
                    ? 'Today is your peak fertility day — highest chance of conception.'
                    : `Fertile window runs through ${formatShortDate(prediction.fertileEnd)}.`}
                </div>
              </div>
            </div>
          )}

          {/* Phase card */}
          <PhaseCard prediction={prediction} cycleLength={profile.averageCycleLength} />

          {/* Upcoming */}
          <Card>
            <CardBody className="p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Upcoming</h2>
              <div className="space-y-3">
                <UpcomingRow icon="🌸" label="Ovulation (predicted)" date={prediction.ovulationDate} color="text-pink-600" />
                <UpcomingRow icon="📅" label="Next period (predicted)" date={prediction.nextPeriodDate} color="text-violet-600" />
                <UpcomingRow icon="🌿" label="Fertile window opens" date={prediction.fertileStart} color="text-emerald-600" />
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Quick log CTA */}
      <Link href="/log">
        <Card className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl text-white cursor-pointer hover:opacity-95 active:scale-[0.99] transition-transform">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">Log today</div>
              <div className="text-sm opacity-80">Track your flow, symptoms &amp; mood</div>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <PenLine size={22} />
            </div>
          </CardBody>
        </Card>
      </Link>
    </div>
  )
}

function PhaseCard({ prediction, cycleLength }: { prediction: CyclePrediction; cycleLength: number }) {
  const info = getPhaseInfo(prediction.currentPhase)
  return (
    <Card className={`${info.bgColor} border ${info.borderColor}`}>
      <CardBody className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold uppercase tracking-wide ${info.color}`}>Current phase</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${info.bgColor} ${info.color} border ${info.borderColor}`}>
            Day {prediction.currentCycleDay} of {cycleLength}
          </span>
        </div>
        <h2 className={`text-xl font-bold mb-2 ${info.color}`}>{info.name}</h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{info.description}</p>
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tips</p>
          <ul className="space-y-1.5">
            {info.tips.slice(0, 3).map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nourishing foods</p>
          <div className="flex flex-wrap gap-1.5">
            {info.foods.map((food) => (
              <span key={food} className="text-xs px-2.5 py-1 rounded-full bg-white/70 text-gray-700 border border-white/50">{food}</span>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-black/5">
          <span className="text-xs text-gray-500">🏃 <span className="font-medium">Exercise:</span> {info.exercise}</span>
        </div>
      </CardBody>
    </Card>
  )
}

function UpcomingRow({ icon, label, date, color }: { icon: string; label: string; date: Date; color: string }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const days = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${color}`}>
          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
        </div>
        <div className="text-xs text-gray-400">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  )
}
