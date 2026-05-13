'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { calculateAverageCycleLength, getPhaseInfo, calculateCyclePredictions, calculatePatternInsights } from '@/lib/cycle-calculations'
import { Card, CardBody } from '@/components/ui/Card'
import { TrendingUp, Activity, Heart, Lightbulb, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react'
import type { PatternInsight } from '@/lib/types'

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: 'Cramps', headache: 'Headache', bloating: 'Bloating', breast_tenderness: 'Breast tenderness',
  backache: 'Backache', nausea: 'Nausea', fatigue: 'Fatigue', acne: 'Acne',
  mood_swings: 'Mood swings', insomnia: 'Insomnia', hot_flashes: 'Hot flashes', spotting: 'Spotting',
}
const MOOD_LABELS: Record<string, string> = {
  happy: '😊 Happy', calm: '😌 Calm', energetic: '⚡ Energetic',
  anxious: '😰 Anxious', irritable: '😤 Irritable', sad: '😢 Sad', tired: '😪 Tired',
}

interface InsightsData {
  cycles: { cycleLength: number | null; startDate: string; endDate: string | null }[]
  logs: { symptoms: string[]; mood: string | null; flow: string | null }[]
  ovulationLogs: { date: string; confirmed: boolean; lhSurge: boolean; bbt: number | null }[]
  profile: { averageCycleLength: number; averagePeriodLength: number; lastPeriodStart: string | null; tryingToConceive: boolean } | null
}

export default function InsightsPage() {
  const { status } = useSession()
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/insights').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [status])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading insights...</div>

  const { cycles = [], logs = [], ovulationLogs = [], profile } = data ?? {}
  const { average: avgCycleLen, stdDev } = calculateAverageCycleLength(
    cycles.map(c => ({ ...c, cycle_length: c.cycleLength, id: '', user_id: '', created_at: '', start_date: c.startDate, end_date: null, period_length: null }))
  )

  const cycleLengthData = cycles.filter(c => c.cycleLength).slice(0, 12).reverse().map((c, i) => ({ name: `C${i + 1}`, days: c.cycleLength }))

  const symptomCounts: Record<string, number> = {}
  logs.forEach(l => l.symptoms?.forEach(s => { symptomCounts[s] = (symptomCounts[s] ?? 0) + 1 }))
  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([key, count]) => ({ name: SYMPTOM_LABELS[key] ?? key, count }))

  const moodCounts: Record<string, number> = {}
  logs.forEach(l => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] ?? 0) + 1 })
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ name: MOOD_LABELS[key] ?? key, count }))

  const patternInsights = calculatePatternInsights(
    cycles,
    ovulationLogs,
    profile?.averageCycleLength ?? 28
  )

  const prediction = profile?.lastPeriodStart
    ? calculateCyclePredictions(profile.lastPeriodStart, profile.averageCycleLength, profile.averagePeriodLength)
    : null
  const phaseInfo = prediction ? getPhaseInfo(prediction.currentPhase) : null
  const totalLogged = logs.filter(l => l.flow || l.symptoms?.length || l.mood).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your cycle patterns and trends</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<TrendingUp size={16} className="text-violet-500" />} value={`${avgCycleLen}d`} label="Avg cycle" />
        <StatCard icon={<Activity size={16} className="text-rose-500" />} value={`${profile?.averagePeriodLength ?? 5}d`} label="Avg period" />
        <StatCard icon={<Heart size={16} className="text-pink-500" />} value={totalLogged} label="Days logged" />
      </div>

      {/* Cycle regularity */}
      {cycles.length > 0 && (
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">Cycle regularity</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stdDev <= 2 ? 'bg-emerald-50 text-emerald-600' : stdDev <= 4 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                {stdDev <= 2 ? 'Very regular' : stdDev <= 4 ? 'Slightly irregular' : 'Irregular'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Your cycles vary by ±{stdDev} days on average.</p>
            {cycleLengthData.length > 1 ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={cycleLengthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [`${v} days`, 'Length']} />
                  <Line type="monotone" dataKey="days" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-20 text-xs text-gray-400">Log at least 2 cycles to see your trend</div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Cycle Pattern Insights */}
      <CyclePatternInsights
        insights={patternInsights}
        ttc={profile?.tryingToConceive ?? false}
        avgCycleLength={profile?.averageCycleLength ?? 28}
        cycleCount={cycles.length}
      />

      {/* Symptoms */}
      {topSymptoms.length > 0 && (
        <Card>
          <CardBody className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Most common symptoms</h3>
            <ResponsiveContainer width="100%" height={Math.max(100, topSymptoms.length * 30)}>
              <BarChart data={topSymptoms} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} width={110} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [`${v}×`, 'Logged']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {topSymptoms.map((_, i) => <Cell key={i} fill={i === 0 ? '#7c3aed' : i === 1 ? '#a855f7' : '#c084fc'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Mood */}
      {topMoods.length > 0 && (
        <Card>
          <CardBody className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Mood patterns</h3>
            <div className="space-y-2">
              {topMoods.map(({ name, count }) => {
                const max = topMoods[0]?.count ?? 1
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-28 shrink-0">{name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-400" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Phase tips */}
      {phaseInfo && prediction && (
        <Card className={`${phaseInfo.bgColor} border ${phaseInfo.borderColor}`}>
          <CardBody className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className={phaseInfo.color} />
              <h3 className={`text-sm font-semibold ${phaseInfo.color}`}>Tips for {phaseInfo.name}</h3>
            </div>
            <ul className="space-y-2">
              {phaseInfo.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 shrink-0 text-gray-400">•</span><span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {logs.length === 0 && cycles.length === 0 && (
        <Card><CardBody className="p-8 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 mb-1">No data yet</h3>
          <p className="text-sm text-gray-500">Start logging your cycle to see personalized insights.</p>
        </CardBody></Card>
      )}

      <p className="text-xs text-center text-gray-400 pb-2">Predictions are statistical estimates, not medical advice.</p>
    </div>
  )
}

function CyclePatternInsights({ insights, ttc, avgCycleLength, cycleCount }: { insights: PatternInsight; ttc: boolean; avgCycleLength: number; cycleCount: number }) {
  const {
    averageOvulationDay, averageLutealPhase, shortLutealPhase, delayedOvulation,
    cyclesStabilizing, irregularCycles, longCycles, stdDev,
    anovulatoryCycleCount, totalCyclesAnalyzed, ovulationDataCycles, potentialPcosPattern,
  } = insights

  if (cycleCount < 2) {
    return (
      <Card>
        <CardBody className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Cycle Pattern Insights</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Avg ovulation day', hint: 'Log LH surge or confirm ovulation' },
              { label: 'Luteal phase estimate', hint: 'Available after 1 full cycle' },
              { label: 'Cycle variation', hint: 'Available after 2 cycles' },
              { label: 'Delayed ovulation alerts', hint: 'Available after 2 cycles' },
            ].map(({ label, hint }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-xs text-gray-300 italic">{hint}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Log your period start dates to unlock cycle pattern analysis.
          </p>
        </CardBody>
      </Card>
    )
  }

  const alerts: { icon: React.ReactNode; color: string; bg: string; border: string; title: string; body: string }[] = []

  if (cyclesStabilizing === true) {
    alerts.push({
      icon: <CheckCircle size={16} />, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200',
      title: 'Your cycles appear to be stabilizing',
      body: 'Cycle-to-cycle variation has decreased recently — a positive sign of hormonal regularity.',
    })
  }

  if (delayedOvulation && ovulationDataCycles >= 2) {
    alerts.push({
      icon: <Clock size={16} />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
      title: 'Delayed ovulation detected',
      body: `Ovulation is occurring around day ${averageOvulationDay ?? '—'}, later than the typical day ${Math.round(avgCycleLength - 14)}. This is common and can be influenced by stress, weight changes, or hormonal shifts.`,
    })
  } else if (delayedOvulation && longCycles) {
    alerts.push({
      icon: <Clock size={16} />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200',
      title: 'Ovulation likely delayed',
      body: 'Your longer cycles suggest ovulation may be occurring later in your cycle. Tracking LH surge or BBT will help pinpoint your actual ovulation day.',
    })
  }

  if (shortLutealPhase && ttc) {
    alerts.push({
      icon: <AlertTriangle size={16} />, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200',
      title: 'Short luteal phase',
      body: `Your luteal phase averages ${averageLutealPhase} days. A phase under 10 days may reduce the window for implantation. Speak with your doctor if you're having difficulty conceiving.`,
    })
  }

  if (anovulatoryCycleCount >= 2) {
    alerts.push({
      icon: <Info size={16} />, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200',
      title: `${anovulatoryCycleCount} cycle${anovulatoryCycleCount > 1 ? 's' : ''} with no logged ovulation`,
      body: 'No LH surge or confirmed ovulation was recorded for some cycles. This may mean ovulation wasn\'t tracked — or it may indicate anovulatory cycles. Log OPK and BBT data for a clearer picture.',
    })
  }

  if (potentialPcosPattern) {
    alerts.push({
      icon: <Info size={16} />, color: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-200',
      title: 'Cycle pattern worth discussing with your doctor',
      body: 'Your data shows long or irregular cycles with signs of delayed or infrequent ovulation — patterns sometimes associated with PCOS or other hormonal imbalances. This is not a diagnosis. A doctor can confirm with bloodwork and ultrasound.',
    })
  }

  return (
    <Card>
      <CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Cycle Pattern Insights</h3>
          <span className="text-xs text-gray-400">{totalCyclesAnalyzed} cycles analysed</span>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-violet-700">
              {averageOvulationDay ? `Day ${averageOvulationDay}` : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Avg ovulation day</div>
            {ovulationDataCycles > 0 && (
              <div className="text-[10px] text-gray-400 mt-0.5">from {ovulationDataCycles} tracked cycles</div>
            )}
            {ovulationDataCycles === 0 && (
              <div className="text-[10px] text-gray-400 mt-0.5">log LH surge to track</div>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${shortLutealPhase ? 'text-rose-600' : 'text-violet-700'}`}>
              {averageLutealPhase ? `${averageLutealPhase}d` : '—'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Avg luteal phase</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {averageLutealPhase ? (averageLutealPhase >= 10 ? 'normal range' : 'below normal') : 'log ovulation to track'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${irregularCycles ? 'text-amber-600' : 'text-emerald-600'}`}>
              ±{stdDev}d
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Cycle variation</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {stdDev <= 3 ? 'very regular' : stdDev <= 7 ? 'slightly irregular' : 'irregular'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${longCycles ? 'text-amber-600' : 'text-violet-700'}`}>
              {longCycles ? 'Long' : irregularCycles ? 'Irregular' : 'Regular'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Cycle pattern</div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              {longCycles ? 'avg > 35 days' : `±${stdDev}d variation`}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {alerts.map((alert, i) => (
              <div key={i} className={`flex gap-3 rounded-xl border p-3.5 ${alert.bg} ${alert.border}`}>
                <span className={`shrink-0 mt-0.5 ${alert.color}`}>{alert.icon}</span>
                <div>
                  <p className={`text-xs font-semibold ${alert.color}`}>{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{alert.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cyclesStabilizing === null && (
          <p className="text-xs text-gray-400 text-center">Log 6+ cycles to see stabilization trends</p>
        )}

        <p className="text-[10px] text-gray-400 text-center leading-relaxed pt-1">
          Patterns are statistical observations, not medical diagnoses. Always consult a healthcare provider.
        </p>
      </CardBody>
    </Card>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <Card variant="bordered" className="text-center">
      <CardBody className="p-4">
        <div className="flex justify-center mb-1.5">{icon}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </CardBody>
    </Card>
  )
}
