'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { Logo } from '@/components/Logo'
import { User, Settings, LogOut, Check, Baby } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileData {
  name: string | null
  email: string
  dateOfBirth: string | null
  averageCycleLength: number
  averagePeriodLength: number
  tryingToConceive: boolean
  lastPeriodStart: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [lastPeriodStart, setLastPeriodStart] = useState('')
  const [avgCycleLen, setAvgCycleLen] = useState('28')
  const [avgPeriodLen, setAvgPeriodLen] = useState('5')
  const [ttc, setTtc] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/profile')
      .then(r => r.json())
      .then((prof: ProfileData) => {
        setName(prof.name ?? '')
        setDob(prof.dateOfBirth ?? '')
        setLastPeriodStart(prof.lastPeriodStart ?? '')
        setAvgCycleLen(String(prof.averageCycleLength))
        setAvgPeriodLen(String(prof.averagePeriodLength))
        setTtc(prof.tryingToConceive)
        setLoading(false)
      })
  }, [status])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        dateOfBirth: dob || null,
        lastPeriodStart: lastPeriodStart || null,
        averageCycleLength: Math.max(20, Math.min(60, parseInt(avgCycleLen) || 28)),
        averagePeriodLength: Math.max(2, Math.min(10, parseInt(avgPeriodLen) || 5)),
        tryingToConceive: ttc,
      }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading...</div>

  const initials = name ? name[0].toUpperCase() : (session?.user?.email?.[0].toUpperCase() ?? '?')

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{name || 'Your profile'}</h1>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <Card>
          <CardBody className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-violet-500" />
              <h2 className="font-semibold text-gray-800">Personal info</h2>
            </div>
            <Input label="Your name" type="text" placeholder="Jen" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Date of birth" type="date" value={dob} onChange={e => setDob(e.target.value)} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={16} className="text-violet-500" />
              <h2 className="font-semibold text-gray-800">Cycle settings</h2>
            </div>
            <Input label="Last period start date" type="date" value={lastPeriodStart} onChange={e => setLastPeriodStart(e.target.value)} hint="The first day of your most recent period" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Avg cycle length</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={20} max={60} value={avgCycleLen} onChange={e => setAvgCycleLen(e.target.value)} className="flex-1 accent-violet-600" />
                  <span className="text-sm font-semibold text-violet-700 w-10 text-right">{avgCycleLen}d</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Typical: 21–45 days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Avg period length</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={2} max={10} value={avgPeriodLen} onChange={e => setAvgPeriodLen(e.target.value)} className="flex-1 accent-violet-600" />
                  <span className="text-sm font-semibold text-violet-700 w-10 text-right">{avgPeriodLen}d</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Typical: 3–7 days</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center"><Baby size={16} className="text-pink-500" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Trying to conceive</p>
                  <p className="text-xs text-gray-500">Show extra fertility details</p>
                </div>
              </div>
              <button type="button" onClick={() => setTtc(!ttc)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', ttc ? 'bg-pink-500' : 'bg-gray-200')}>
                <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', ttc ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
            {ttc && (
              <div className="mt-4 p-3 rounded-xl bg-pink-50 border border-pink-100 text-xs text-pink-700 leading-relaxed">
                💕 Fertility window and ovulation predictions will be highlighted more prominently. Track BBT, cervical mucus, and OPK together for the best picture.
              </div>
            )}
          </CardBody>
        </Card>

        <Button type="submit" loading={saving} size="lg" className="w-full">
          {saved ? <span className="flex items-center gap-2"><Check size={18} /> Saved!</span> : 'Save profile'}
        </Button>
      </form>

      <Card>
        <CardBody className="p-5">
          <div className="flex items-center gap-3 mb-3"><Logo size="sm" /><div><p className="text-sm font-semibold text-gray-800">Glow</p><p className="text-xs text-gray-400">Free &amp; open source</p></div></div>
          <p className="text-xs text-gray-500 leading-relaxed">Your health data is stored in a local SQLite database on this device — never shared or uploaded anywhere.</p>
        </CardBody>
      </Card>

      <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors">
        <LogOut size={16} /> Sign out
      </button>

      <div className="h-4" />
    </div>
  )
}
