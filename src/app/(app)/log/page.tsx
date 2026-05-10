'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import type { FlowLevel, Mood, CervicalMucus } from '@/lib/types'
import { ChevronLeft, ChevronRight, Check, Thermometer, Droplets } from 'lucide-react'
import { cn } from '@/lib/utils'

const SYMPTOMS = [
  { key: 'cramps', label: 'Cramps', emoji: '😣' },
  { key: 'headache', label: 'Headache', emoji: '🤕' },
  { key: 'bloating', label: 'Bloating', emoji: '😮‍💨' },
  { key: 'breast_tenderness', label: 'Breast tenderness', emoji: '🩹' },
  { key: 'backache', label: 'Backache', emoji: '🏥' },
  { key: 'nausea', label: 'Nausea', emoji: '🤢' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'acne', label: 'Acne', emoji: '😬' },
  { key: 'mood_swings', label: 'Mood swings', emoji: '😤' },
  { key: 'insomnia', label: 'Insomnia', emoji: '🌙' },
  { key: 'hot_flashes', label: 'Hot flashes', emoji: '🔥' },
  { key: 'spotting', label: 'Spotting', emoji: '💧' },
]
const MOODS: { key: Mood; label: string; emoji: string }[] = [
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'calm', label: 'Calm', emoji: '😌' },
  { key: 'energetic', label: 'Energetic', emoji: '⚡' },
  { key: 'anxious', label: 'Anxious', emoji: '😰' },
  { key: 'irritable', label: 'Irritable', emoji: '😤' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'tired', label: 'Tired', emoji: '😪' },
]
const FLOWS: { key: FlowLevel; label: string; color: string }[] = [
  { key: 'spotting', label: 'Spotting', color: 'bg-rose-100 text-rose-500 border-rose-200' },
  { key: 'light', label: 'Light', color: 'bg-rose-200 text-rose-600 border-rose-300' },
  { key: 'medium', label: 'Medium', color: 'bg-rose-400 text-white border-rose-400' },
  { key: 'heavy', label: 'Heavy', color: 'bg-rose-600 text-white border-rose-600' },
]
const MUCUS: { key: CervicalMucus; label: string; desc: string }[] = [
  { key: 'dry', label: 'Dry', desc: 'None' },
  { key: 'sticky', label: 'Sticky', desc: 'Thick' },
  { key: 'creamy', label: 'Creamy', desc: 'Lotion' },
  { key: 'watery', label: 'Watery', desc: 'Wet' },
  { key: 'egg_white', label: 'Egg white', desc: 'Stretchy' },
]

function addDays(date: Date, n: number) { const d = new Date(date); d.setDate(d.getDate() + n); return d }
function toDateStr(d: Date) { return d.toISOString().split('T')[0] }
function fromDateStr(s: string) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }

function LogContent() {
  const { status } = useSession()
  const searchParams = useSearchParams()
  const initialDate = searchParams.get('date') ?? toDateStr(new Date())

  const [currentDate, setCurrentDate] = useState(initialDate)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [hasPeriod, setHasPeriod] = useState(false)
  const [flow, setFlow] = useState<FlowLevel | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [mood, setMood] = useState<Mood | null>(null)
  const [lhSurge, setLhSurge] = useState(false)
  const [bbt, setBbt] = useState('')
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | null>(null)
  const [notes, setNotes] = useState('')

  const loadLog = useCallback(async (date: string) => {
    setLoading(true)
    const res = await fetch(`/api/logs?date=${date}`)
    const { periodLog, ovulationLog } = await res.json()

    if (periodLog) {
      setHasPeriod(!!periodLog.flow)
      setFlow(periodLog.flow)
      setSymptoms(periodLog.symptoms ?? [])
      setMood(periodLog.mood)
      setNotes(periodLog.notes ?? '')
    } else {
      setHasPeriod(false); setFlow(null); setSymptoms([]); setMood(null); setNotes('')
    }
    if (ovulationLog) {
      setLhSurge(ovulationLog.lhSurge)
      setBbt(ovulationLog.bbt?.toString() ?? '')
      setCervicalMucus(ovulationLog.cervicalMucus)
    } else {
      setLhSurge(false); setBbt(''); setCervicalMucus(null)
    }
    setLoading(false)
    setSaved(false)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') { window.location.href = '/login'; return }
    if (status === 'authenticated') loadLog(currentDate)
  }, [status, currentDate, loadLog])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: currentDate,
        period: { flow: hasPeriod ? flow : null, symptoms, mood, notes: notes || null },
        ovulation: { lhSurge, bbt: bbt ? parseFloat(bbt) : null, cervicalMucus },
      }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const dateObj = fromDateStr(currentDate)
  const isToday = currentDate === toDateStr(new Date())
  const isFuture = dateObj > new Date()
  const dateLabel = isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Date nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <button onClick={() => setCurrentDate(toDateStr(addDays(dateObj, -1)))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-semibold text-gray-900">{dateLabel}</div>
          <div className="text-xs text-gray-400">{dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <button onClick={() => { if (!isFuture) setCurrentDate(toDateStr(addDays(dateObj, 1))) }} disabled={isFuture} className={cn('p-1.5 rounded-lg text-gray-500', isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100')}>
          <ChevronRight size={18} />
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
        <>
          {/* Period */}
          <Card>
            <CardBody className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Droplets size={18} className="text-rose-500" /><h2 className="font-semibold text-gray-900">Period</h2></div>
                <button type="button" onClick={() => { setHasPeriod(!hasPeriod); if (hasPeriod) setFlow(null) }} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', hasPeriod ? 'bg-rose-500' : 'bg-gray-200')}>
                  <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', hasPeriod ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </div>
              {hasPeriod && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Flow</p>
                  <div className="flex gap-2">
                    {FLOWS.map(({ key, label, color }) => (
                      <button key={key} type="button" onClick={() => setFlow(key)} className={cn('flex-1 py-3 rounded-xl text-xs font-medium border transition-all', flow === key ? color : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100')}>{label}</button>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Symptoms */}
          <Card>
            <CardBody className="p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Symptoms</h2>
              <div className="grid grid-cols-3 gap-2">
                {SYMPTOMS.map(({ key, label, emoji }) => (
                  <button key={key} type="button" onClick={() => setSymptoms(p => p.includes(key) ? p.filter(s => s !== key) : [...p, key])} className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all', symptoms.includes(key) ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100')}>
                    <span className="text-base">{emoji}</span>
                    <span className="text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Mood */}
          <Card>
            <CardBody className="p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Mood</h2>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(({ key, label, emoji }) => (
                  <button key={key} type="button" onClick={() => setMood(mood === key ? null : key)} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all', mood === key ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100')}>
                    <span>{emoji}</span>{label}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Ovulation signs */}
          <Card>
            <CardBody className="p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Ovulation Signs</h2>
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-gray-700">LH Surge (OPK positive)</p><p className="text-xs text-gray-400">Did your ovulation test turn positive?</p></div>
                <button type="button" onClick={() => setLhSurge(!lhSurge)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', lhSurge ? 'bg-pink-500' : 'bg-gray-200')}>
                  <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', lhSurge ? 'translate-x-6' : 'translate-x-1')} />
                </button>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5"><Thermometer size={15} className="text-orange-400" /><label className="text-sm font-medium text-gray-700">Basal Body Temp (°F)</label></div>
                <input type="number" step="0.01" min="96" max="100" placeholder="e.g. 97.6" value={bbt} onChange={(e) => setBbt(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cervical Mucus</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {MUCUS.map(({ key, label, desc }) => (
                    <button key={key} type="button" onClick={() => setCervicalMucus(cervicalMucus === key ? null : key)} className={cn('flex flex-col items-center gap-0.5 py-3 px-1 rounded-xl border text-center transition-all min-h-[52px]', cervicalMucus === key ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100')}>
                      <span className="text-[11px] font-medium leading-tight">{label}</span>
                      <span className="text-[10px] text-gray-400 leading-tight">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notes */}
          <Card><CardBody className="p-5"><Textarea label="Notes" placeholder="How are you feeling today? Any other observations..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></CardBody></Card>

          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
            {saved ? <span className="flex items-center gap-2"><Check size={18} /> Saved!</span> : 'Save log'}
          </Button>
          <p className="text-center text-xs text-gray-400 pb-2">Your data is stored locally on this device</p>
        </>
      )}
    </div>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading...</div>}>
      <LogContent />
    </Suspense>
  )
}
