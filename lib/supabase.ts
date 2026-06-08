import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type MealType = 'desayuno' | 'almuerzo' | 'merienda' | 'cena' | 'extra'
export type Feeling = 'sobrado' | 'bien' | 'muy_cansado'

export interface PlanExercise {
  name: string
  sets: number
  reps: string
  notes?: string
  day: string
}

export interface MealPlan {
  desayuno: string
  almuerzo: string
  merienda: string
  cena: string
  extra: string
}

export interface Plan {
  id: string
  created_at: string
  start_date: string
  end_date: string
  routine: PlanExercise[]
  diet_notes: string
  meals_plan: MealPlan
}

export interface SetLog {
  set_number: number
  weight: number
  reps: number
}

export interface GymSession {
  id: string
  created_at: string
  date: string
  time_in: string
  time_out?: string
  feeling?: Feeling
  plan_id?: string
  notes?: string
}

export interface GymExercise {
  id: string
  session_id: string
  name: string
  sets: SetLog[]
  notes?: string
}

export interface FoodLog {
  id: string
  created_at: string
  date: string
  meal_type: MealType
  description: string
  notes?: string
}
