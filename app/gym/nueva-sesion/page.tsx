'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Plan, PlanExercise, Feeling, SetLog } from '@/lib/supabase'
import { ArrowLeft, ChevronLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

interface ExerciseEntry {
  name: string
  sets: SetLog[]
  restriction: string
}

const FEELING_OPTIONS: { value: Feeling; label: string }[] = [
  { value: 'sobrado', label: '💪 Sobrado' },
  { value: 'bien', label: '✅ Bien' },
  { value: 'muy_cansado', label: '😮‍💨 Cansado' },
]

const DAY_CONFIG = [
  { key: 'DÍA 1 — PUSH', num: '1', name: 'PUSH' },
  { key: 'DÍA 2 — PULL', num: '2', name: 'PULL' },
  { key: 'DÍA 3 — LEGS', num: '3', name: 'LEGS' },
  { key: 'DÍA 4 — FULL BODY', num: '4', name: 'FULL BODY' },
]

export default function NuevaSesion() {
  const router = useRouter()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suggestedDay, setSuggestedDay] = useState<string | null>(null)

  // Step 1: pick day / Step 2: fill exercises
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])

  const now = new Date()
  const [date] = useState(now.toISOString().split('T')[0])
  const [timeIn] = useState(now.toTimeString().slice(0, 5))
  const [feeling, setFeeling] = useState<Feeling>('bien')

  async function detectNextDay(planExercises: PlanExercise[]): Promise<string | null> {
    const { data: sessions } = await supabase
      .from('gym_sessions')
      .select('id')
      .order('date', { ascending: false })
      .limit(1)

    if (!sessions || sessions.length === 0) return DAY_CONFIG[0].key

    const { data: lastExs } = await supabase
      .from('gym_exercises')
      .select('name')
      .eq('session_id', sessions[0].id)

    if (!lastExs || lastExs.length === 0) return DAY_CONFIG[0].key

    const exerciseNames = new Set(lastExs.map((e: { name: string }) => e.name.toLowerCase()))

    const dayGroups: Record<string, string[]> = {}
    for (const pe of planExercises) {
      if (!dayGroups[pe.day]) dayGroups[pe.day] = []
      dayGroups[pe.day].push(pe.name.toLowerCase())
    }

    let bestDay: string | null = null
    let bestCount = 0
    for (const [day, names] of Object.entries(dayGroups)) {
      const count = names.filter(n => exerciseNames.has(n)).length
      if (count > bestCount) { bestCount = count; bestDay = day }
    }

    if (!bestDay) return DAY_CONFIG[0].key
    const dayKeys = DAY_CONFIG.map(d => d.key)
    return dayKeys[(dayKeys.indexOf(bestDay) + 1) % dayKeys.length]
  }

  async function fetchCurrentPlan() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('plans')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)

    const activePlan = data?.[0] ?? null
    setPlan(activePlan)

    if (activePlan) {
      const suggested = await detectNextDay(activePlan.routine as PlanExercise[])
      setSuggestedDay(suggested)
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCurrentPlan() }, [])

  function pickDay(dayKey: string) {
    if (!plan) return
    const dayExercises = (plan.routine as PlanExercise[]).filter(e => e.day === dayKey)
    setExercises(dayExercises.map(e => ({
      name: e.name,
      restriction: e.notes || '',
      sets: Array.from({ length: e.sets }, (_, i) => ({
        set_number: i + 1,
        weight: 0,
        reps: parseInt(e.reps) || 10,
      })),
    })))
    setSelectedDay(dayKey)
  }

  function addSet(exIdx: number) {
    setExercises(prev => prev.map((e, i) => {
      if (i !== exIdx) return e
      const last = e.sets[e.sets.length - 1]
      return { ...e, sets: [...e.sets, { set_number: e.sets.length + 1, weight: last?.weight || 0, reps: last?.reps || 10 }] }
    }))
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises(prev => prev.map((e, i) =>
      i !== exIdx ? e : { ...e, sets: e.sets.filter((_, si) => si !== setIdx) }
    ))
  }

  function updateSet(exIdx: number, setIdx: number, field: 'weight' | 'reps', raw: string) {
    const value = field === 'weight' ? parseFloat(raw) || 0 : parseInt(raw) || 0
    setExercises(prev => prev.map((e, i) =>
      i !== exIdx ? e : { ...e, sets: e.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
    ))
  }

  async function handleSave() {
    if (!selectedDay || !exercises.length) return
    setSaving(true)
    try {
      const { data: session, error: sessionError } = await supabase
        .from('gym_sessions')
        .insert({ date, time_in: timeIn, feeling, plan_id: plan?.id || null })
        .select()
        .single()

      if (sessionError) throw sessionError

      const exercisesData = exercises.filter(e => e.name.trim()).map(e => ({
        session_id: session.id,
        name: e.name,
        sets: e.sets,
        notes: e.restriction || null,
      }))

      const { error: exError } = await supabase.from('gym_exercises').insert(exercisesData)
      if (exError) throw exError

      router.push('/historial?tab=gym')
    } catch (err) {
      console.error(err)
      alert('Error al guardar. Revisá la consola.')
    } finally {
      setSaving(false)
    }
  }

  const dayConfig = DAY_CONFIG.find(d => d.key === selectedDay)

  // ── STEP 1: Pick day ──────────────────────────────────────────────────────
  if (!selectedDay) {
    return (
      <main style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
          <h1 style={{ fontSize: '1.8rem' }}>NUEVA SESIÓN</h1>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '3rem' }}>Cargando plan...</p>
        ) : !plan ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <p>No hay un plan activo para hoy.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>
              ¿Qué día entrenás hoy?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {DAY_CONFIG.map(day => {
                const isSuggested = suggestedDay === day.key
                return (
                  <button
                    key={day.key}
                    onClick={() => pickDay(day.key)}
                    style={{
                      background: isSuggested ? 'var(--accent-dim)' : 'var(--surface)',
                      border: `2px solid ${isSuggested ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      padding: '1.1rem 1.1rem 1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSuggested && (
                      <span style={{
                        position: 'absolute', top: 7, right: 7,
                        fontSize: '0.55rem', background: 'var(--accent)', color: '#000',
                        padding: '2px 6px', borderRadius: 4, fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>SIGUIENTE</span>
                    )}
                    <div style={{
                      fontFamily: 'Bebas Neue, sans-serif', fontSize: '0.75rem',
                      letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 3,
                    }}>DÍA {day.num}</div>
                    <div style={{
                      fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.75rem',
                      letterSpacing: '0.03em', color: 'var(--text)', lineHeight: 1,
                    }}>{day.name}</div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </main>
    )
  }

  // ── STEP 2: Fill exercises ────────────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem 1rem 110px', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => setSelectedDay(null)}
          className="btn btn-ghost btn-sm"
        ><ChevronLeft size={16} /></button>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            DÍA {dayConfig?.num}
          </div>
          <h1 style={{ fontSize: '1.8rem', lineHeight: 1 }}>{dayConfig?.name}</h1>
        </div>
      </div>

      {/* Compact feeling */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FEELING_OPTIONS.map(f => (
          <button
            key={f.value}
            onClick={() => setFeeling(f.value)}
            style={{
              padding: '0.35rem 0.75rem', borderRadius: 7, fontSize: '0.8rem', fontWeight: 600,
              border: `2px solid ${feeling === f.value ? 'var(--accent)' : 'var(--border)'}`,
              background: feeling === f.value ? 'var(--accent-dim)' : 'transparent',
              color: feeling === f.value ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Exercises */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {exercises.map((ex, exIdx) => (
          <div key={exIdx} className="card" style={{ borderColor: 'rgba(200,240,77,0.12)' }}>

            {/* Name */}
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.3rem',
              letterSpacing: '0.04em', color: 'var(--text)',
              marginBottom: ex.restriction ? '0.35rem' : '0.9rem',
            }}>{ex.name}</div>

            {/* Restriction */}
            {ex.restriction && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'rgba(240,90,77,0.1)', border: '1px solid rgba(240,90,77,0.22)',
                borderRadius: 6, padding: '3px 8px', fontSize: '0.73rem',
                color: 'var(--red)', marginBottom: '0.9rem',
              }}>⚠️ {ex.restriction}</div>
            )}

            {/* Sets header */}
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 32px', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center' }}>#</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>KG</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>REPS</span>
              <span />
            </div>

            {/* Set rows */}
            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 32px', gap: '0.4rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>{set.set_number}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={set.weight === 0 ? '' : set.weight}
                  onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  style={{ fontSize: '1.2rem', padding: '0.7rem 0.4rem', textAlign: 'center', fontWeight: 700 }}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  value={set.reps === 0 ? '' : set.reps}
                  onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                  placeholder="0"
                  min="0"
                  style={{ fontSize: '1.2rem', padding: '0.7rem 0.4rem', textAlign: 'center', fontWeight: 700 }}
                />
                <button
                  onClick={() => removeSet(exIdx, setIdx)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><Trash2 size={13} /></button>
              </div>
            ))}

            {/* + Serie */}
            <button
              onClick={() => addSet(exIdx)}
              style={{
                width: '100%', marginTop: '0.2rem', padding: '0.6rem',
                background: 'transparent', border: '1px dashed var(--border)',
                borderRadius: 8, color: 'var(--accent)', fontWeight: 700,
                fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
              }}
            ><Plus size={13} /> + SERIE</button>

          </div>
        ))}
      </div>

      {/* Fixed save */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '0.85rem 1rem',
        background: 'var(--bg)', borderTop: '1px solid var(--border)', zIndex: 50,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
          >
            <Save size={18} /> {saving ? 'Guardando...' : 'GUARDAR SESIÓN'}
          </button>
        </div>
      </div>

    </main>
  )
}
