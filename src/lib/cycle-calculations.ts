import type { Cycle, CyclePhase, CyclePrediction, PhaseInfo } from './types'
import { parseDateString } from './utils'

export function calculateCyclePredictions(
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): CyclePrediction {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = parseDateString(lastPeriodStart)
  start.setHours(0, 0, 0, 0)

  const msPerDay = 1000 * 60 * 60 * 24
  const currentCycleDay = Math.floor((today.getTime() - start.getTime()) / msPerDay) + 1

  const nextPeriodDate = new Date(start)
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength)

  const daysUntilNextPeriod = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / msPerDay)

  // Ovulation = 14 days before next period
  const ovulationDate = new Date(nextPeriodDate)
  ovulationDate.setDate(ovulationDate.getDate() - 14)

  // Fertile window: 5 days before ovulation + ovulation day + 1 after
  const fertileStart = new Date(ovulationDate)
  fertileStart.setDate(fertileStart.getDate() - 5)

  const fertileEnd = new Date(ovulationDate)
  fertileEnd.setDate(fertileEnd.getDate() + 1)

  const isFertileToday = today >= fertileStart && today <= fertileEnd
  const isOvulationDay =
    today.toDateString() === ovulationDate.toDateString()
  const isPeriodToday = currentCycleDay >= 1 && currentCycleDay <= periodLength

  return {
    currentCycleDay,
    currentPhase: getCurrentPhase(currentCycleDay, cycleLength, periodLength),
    nextPeriodDate,
    daysUntilNextPeriod,
    ovulationDate,
    fertileStart,
    fertileEnd,
    isFertileToday,
    isOvulationDay,
    isPeriodToday,
  }
}

export function getCurrentPhase(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
): CyclePhase {
  const ovulationDay = cycleLength - 14
  if (cycleDay <= periodLength) return 'menstrual'
  if (cycleDay < ovulationDay - 1) return 'follicular'
  if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) return 'ovulation'
  return 'luteal'
}

export function getPhaseInfo(phase: CyclePhase): PhaseInfo {
  const phases: Record<CyclePhase, PhaseInfo> = {
    menstrual: {
      name: 'Menstrual Phase',
      description:
        'Your body is shedding the uterine lining. Rest, warmth, and nourishment are most important right now. Honor your body\'s need for slowness.',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconColor: '#E11D48',
      tips: [
        'Use a heating pad to ease cramps',
        'Stay hydrated — aim for extra water today',
        'Iron-rich foods help replenish blood loss',
        'Gentle movement eases discomfort better than rest alone',
        'Track your flow intensity to spot patterns',
      ],
      foods: ['Spinach', 'Lentils', 'Dark chocolate', 'Ginger tea', 'Bananas', 'Red meat'],
      exercise: 'Gentle yoga, light walking, stretching',
    },
    follicular: {
      name: 'Follicular Phase',
      description:
        'Estrogen is rising and you\'ll notice increasing energy and mental clarity. This is a great time for creativity, planning, and new beginnings.',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      iconColor: '#7C3AED',
      tips: [
        'Channel your rising energy into new projects',
        'Social activities feel more natural now',
        'Your skin may look clearer and more radiant',
        'Great time to set goals and make decisions',
        'Your memory and focus are sharper during this phase',
      ],
      foods: ['Lean protein', 'Fermented foods', 'Broccoli', 'Berries', 'Flaxseeds', 'Eggs'],
      exercise: 'Cardio, strength training, cycling, running',
    },
    ovulation: {
      name: 'Ovulation Phase',
      description:
        'Peak fertility! You may feel your most confident, social, and energetic. If trying to conceive, this is your most important window.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      iconColor: '#DB2777',
      tips: [
        'Highest chance of conception — timing matters now',
        'Look for clear, stretchy cervical mucus (egg white consistency)',
        'Body temperature rises slightly after ovulation',
        'Libido and energy typically peak now',
        'LH surge predictor kits can confirm ovulation timing',
      ],
      foods: ['Antioxidant foods', 'Pumpkin seeds', 'Leafy greens', 'Quinoa', 'Zinc-rich foods'],
      exercise: 'High-intensity workouts, HIIT, running, dancing',
    },
    luteal: {
      name: 'Luteal Phase',
      description:
        'Progesterone rises and PMS symptoms may appear in later days. Your body is preparing for the next cycle. Extra gentleness goes a long way.',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconColor: '#D97706',
      tips: [
        'Magnesium supplements can reduce PMS symptoms',
        'Reduce caffeine and alcohol to ease bloating',
        'Prioritize sleep — you naturally need more now',
        'Journaling helps process mood swings',
        'Don\'t over-schedule — protect your energy',
      ],
      foods: ['Complex carbs', 'Sweet potatoes', 'Dark chocolate', 'Chamomile tea', 'Salmon', 'Walnuts'],
      exercise: 'Yoga, pilates, swimming, gentle walking',
    },
  }
  return phases[phase]
}

export function calculateAverageCycleLength(cycles: Cycle[]): { average: number; stdDev: number } {
  const lengths = cycles.filter((c) => c.cycle_length !== null).map((c) => c.cycle_length as number)
  if (lengths.length === 0) return { average: 28, stdDev: 0 }
  const avg = lengths.reduce((sum, l) => sum + l, 0) / lengths.length
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length
  return { average: Math.round(avg), stdDev: Math.round(Math.sqrt(variance) * 10) / 10 }
}

export function getFertilityScore(cycleDay: number, cycleLength: number): number {
  const ovulationDay = cycleLength - 14
  const daysFromOvulation = cycleDay - ovulationDay
  if (daysFromOvulation === 0) return 99
  if (daysFromOvulation === -1) return 85
  if (daysFromOvulation === -2) return 80
  if (daysFromOvulation === 1) return 25
  if (daysFromOvulation === -3) return 65
  if (daysFromOvulation === -4) return 45
  if (daysFromOvulation === -5) return 25
  return 5
}

export function getFertileDaysInMonth(
  year: number,
  month: number,
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number
): Map<string, { type: 'period' | 'fertile' | 'ovulation'; cycleDay: number }> {
  const result = new Map<string, { type: 'period' | 'fertile' | 'ovulation'; cycleDay: number }>()
  const start = parseDateString(lastPeriodStart)
  start.setHours(0, 0, 0, 0)
  const msPerDay = 1000 * 60 * 60 * 24

  // Generate predictions for 3 cycles to cover the month
  for (let cycleOffset = -1; cycleOffset <= 3; cycleOffset++) {
    const cycleStart = new Date(start)
    cycleStart.setDate(cycleStart.getDate() + cycleOffset * cycleLength)

    const ovulationDate = new Date(cycleStart)
    ovulationDate.setDate(ovulationDate.getDate() + cycleLength - 14)

    const fertileStart = new Date(ovulationDate)
    fertileStart.setDate(fertileStart.getDate() - 5)

    for (let d = 0; d < cycleLength; d++) {
      const date = new Date(cycleStart)
      date.setDate(date.getDate() + d)

      if (date.getFullYear() !== year || date.getMonth() !== month) continue

      const dateStr = date.toISOString().split('T')[0]
      const cycleDay = d + 1
      const daysFromOvulation = Math.floor((date.getTime() - ovulationDate.getTime()) / msPerDay)

      if (cycleDay <= periodLength) {
        result.set(dateStr, { type: 'period', cycleDay })
      } else if (date.toDateString() === ovulationDate.toDateString()) {
        result.set(dateStr, { type: 'ovulation', cycleDay })
      } else if (daysFromOvulation >= -5 && daysFromOvulation <= 1) {
        if (!result.has(dateStr)) {
          result.set(dateStr, { type: 'fertile', cycleDay })
        }
      }
    }
  }

  return result
}
