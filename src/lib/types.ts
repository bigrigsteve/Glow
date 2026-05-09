export type FlowLevel = 'spotting' | 'light' | 'medium' | 'heavy'
export type CervicalMucus = 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white'
export type Mood = 'happy' | 'calm' | 'anxious' | 'irritable' | 'sad' | 'energetic' | 'tired'
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export interface Profile {
  id: string
  full_name: string | null
  date_of_birth: string | null
  average_cycle_length: number
  average_period_length: number
  trying_to_conceive: boolean
  last_period_start: string | null
  created_at: string
}

export interface Cycle {
  id: string
  user_id: string
  start_date: string
  end_date: string | null
  cycle_length: number | null
  period_length: number | null
  created_at: string
}

export interface PeriodLog {
  id: string
  user_id: string
  date: string
  flow: FlowLevel | null
  symptoms: string[]
  mood: Mood | null
  notes: string | null
  created_at: string
}

export interface OvulationLog {
  id: string
  user_id: string
  date: string
  confirmed: boolean
  bbt: number | null
  cervical_mucus: CervicalMucus | null
  lh_surge: boolean
  notes: string | null
  created_at: string
}

export interface CyclePrediction {
  currentCycleDay: number
  currentPhase: CyclePhase
  nextPeriodDate: Date
  daysUntilNextPeriod: number
  ovulationDate: Date
  fertileStart: Date
  fertileEnd: Date
  isFertileToday: boolean
  isOvulationDay: boolean
  isPeriodToday: boolean
}

export interface PhaseInfo {
  name: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  iconColor: string
  tips: string[]
  foods: string[]
  exercise: string
}

export interface DayLog {
  date: string
  isPeriod: boolean
  flow: FlowLevel | null
  symptoms: string[]
  mood: Mood | null
  isFertile: boolean
  isPredictedOvulation: boolean
  isConfirmedOvulation: boolean
  lhSurge: boolean
  bbt: number | null
  cervicalMucus: CervicalMucus | null
  notes: string | null
}
