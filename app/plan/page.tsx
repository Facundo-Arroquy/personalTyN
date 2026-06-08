'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Plan, PlanExercise, MealPlan } from '@/lib/supabase'
import { ArrowLeft, Calendar, Utensils, Dumbbell } from 'lucide-react'
import Link from 'next/link'

const MEAL_LABELS = [
  { key: 'desayuno', label: 'Desayuno', emoji: '🌅' },
  { key: 'almuerzo', label: 'Almuerzo', emoji: '☀️' },
  { key: 'merienda', label: 'Merienda', emoji: '🍵' },
  { key: 'cena', label: 'Cena', emoji: '🌙' },
  { key: 'extra', label: 'Extra', emoji: '🍎' },
]

const DAYS = ['DÍA 1 — PUSH', 'DÍA 2 — PULL', 'DÍA 3 — LEGS', 'DÍA 4 — FULL BODY']

export default function PlanActual() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(DAYS[0])

  async function fetchPlan() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('plans')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
    if (data && data.length > 0) setPlan(data[0])
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPlan() }, [])

  const dayExercises = plan
    ? (plan.routine as PlanExercise[]).filter(e => e.day === activeDay)
    : []

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
        <h1 style={{ fontSize: '1.8rem' }}>MI PLAN</h1>
      </div>

      {loading && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Cargando...</p>}

      {!loading && !plan && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--muted)' }}>No hay plan activo para hoy.</p>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Tu entrenador cargará uno pronto.</p>
        </div>
      )}

      {!loading && plan && (
        <>
          {/* Period */}
          <div className="card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={18} color="var(--accent)" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Período</p>
              <p style={{ fontWeight: 600 }}>
                {new Date(plan.start_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                {' → '}
                {new Date(plan.end_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Routine */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Dumbbell size={16} color="var(--accent)" />
              <h2 style={{ fontSize: '1.3rem' }}>RUTINA</h2>
            </div>

            {/* Day tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  style={{
                    padding: '0.5rem 0.4rem',
                    borderRadius: 8,
                    border: `2px solid ${activeDay === day ? 'var(--accent)' : 'var(--border)'}`,
                    background: activeDay === day ? 'var(--accent-dim)' : 'transparent',
                    color: activeDay === day ? 'var(--accent)' : 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontFamily: 'Bebas Neue, sans-serif',
                    letterSpacing: '0.05em',
                    transition: 'all 0.15s',
                  }}
                >{day}</button>
              ))}
            </div>

            {dayExercises.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Sin ejercicios cargados para este día.</p>
            )}

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {dayExercises.map((ex, i) => (
                <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{ex.name}</p>
                    {ex.notes && <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.15rem' }}>{ex.notes}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                    <span className="tag tag-green">{ex.sets} × {ex.reps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Utensils size={16} color="var(--blue)" />
              <h2 style={{ fontSize: '1.3rem' }}>DIETA</h2>
            </div>

            {plan.diet_notes && (
              <div className="card" style={{ marginBottom: '0.75rem', borderColor: 'rgba(77,200,240,0.2)' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Notas generales</p>
                <p style={{ fontSize: '0.9rem' }}>{plan.diet_notes}</p>
              </div>
            )}

            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {MEAL_LABELS.map(m => {
                const meals = plan.meals_plan as MealPlan
                const content = meals?.[m.key as keyof MealPlan]
                if (!content) return null
                return (
                  <div key={m.key} className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{m.emoji}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{m.label}</p>
                      <p style={{ fontSize: '0.9rem' }}>{content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
