'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getFertileDaysInMonth } from '@/lib/cycle-calculations'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface DayInfo { hasFlow: boolean; confirmedOvulation: boolean; predicted: 'period' | 'fertile' | 'ovulation' | null }

export default function CalendarPage() {
  const { status } = useSession()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [dayMap, setDayMap] = useState<Map<string, DayInfo>>(new Map())
  const [noProfileSetup, setNoProfileSetup] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return

    fetch(`/api/calendar?year=${year}&month=${month}`)
      .then(r => r.json())
      .then(({ loggedDays, profile }) => {
        const map = new Map<string, DayInfo>()

        if (profile?.lastPeriodStart) {
          const predictedMap = getFertileDaysInMonth(year, month, profile.lastPeriodStart, profile.averageCycleLength, profile.averagePeriodLength)
          predictedMap.forEach(({ type }, dateStr) => {
            map.set(dateStr, { predicted: type, hasFlow: false, confirmedOvulation: false })
          })
        } else {
          setNoProfileSetup(true)
        }

        // Overlay actual logged data
        if (loggedDays) {
          Object.entries(loggedDays).forEach(([date, info]) => {
            const existing = map.get(date) ?? { predicted: null, hasFlow: false, confirmedOvulation: false }
            map.set(date, {
              ...existing,
              hasFlow: (info as { hasFlow?: boolean }).hasFlow ?? false,
              confirmedOvulation: (info as { confirmedOvulation?: boolean }).confirmedOvulation ?? false,
            })
          })
        }

        setDayMap(new Map(map))
      })
  }, [status, year, month])

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today.toISOString().split('T')[0]

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getDayStyle(day: number) {
    const dateStr = toDateStr(day)
    const info = dayMap.get(dateStr)
    if (info?.confirmedOvulation) return 'bg-pink-500 text-white ring-2 ring-pink-300'
    if (info?.hasFlow) return 'bg-rose-500 text-white'
    if (info?.predicted === 'period') return 'bg-rose-200 text-rose-700'
    if (info?.predicted === 'ovulation') return 'bg-pink-400 text-white'
    if (info?.predicted === 'fertile') return 'bg-violet-200 text-violet-700'
    if (dateStr === todayStr) return 'ring-2 ring-violet-500 text-violet-700 font-bold'
    return 'text-gray-700 hover:bg-gray-100'
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronLeft size={20} /></button>
        <h1 className="text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h1>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronRight size={20} /></button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(d => <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 p-2 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = toDateStr(day)
            const isFuture = new Date(year, month, day) > today
            const info = dayMap.get(dateStr)
            return (
              <Link key={day} href={`/log?date=${dateStr}`} className={cn('relative flex items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all', getDayStyle(day), isFuture && 'opacity-40 pointer-events-none')}>
                {day}
                {info?.confirmedOvulation && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px]">⭐</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Legend</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { color: 'bg-rose-500', label: 'Period (logged)' },
            { color: 'bg-rose-200', label: 'Period (predicted)' },
            { color: 'bg-pink-400', label: 'Ovulation (predicted)' },
            { color: 'bg-violet-200', label: 'Fertile window' },
            { color: 'bg-pink-500 ring-2 ring-pink-300', label: 'Ovulation (confirmed)' },
            { color: 'ring-2 ring-violet-500', label: 'Today' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn('w-5 h-5 rounded-lg shrink-0', color)} />
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {noProfileSetup && (
        <div className="text-center py-2 text-sm text-gray-500">
          Set your last period date in{' '}
          <Link href="/profile" className="text-violet-600 font-medium hover:underline">Profile</Link>{' '}
          to see predictions.
        </div>
      )}
    </div>
  )
}
