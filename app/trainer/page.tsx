'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PlanExercise, MealPlan } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['DÍA 1 — PUSH', 'DÍA 2 — PULL', 'DÍA 3 — LEGS', 'DÍA 4 — FULL BODY']

const INITIAL_ROUTINE: PlanExercise[] = [
  // PUSH
  { day: 'DÍA 1 — PUSH', name: 'Press de banca con mancuernas', sets: 4, reps: '8-10', notes: 'Rango parcial, sin bajar el codo por debajo del hombro' },
  { day: 'DÍA 1 — PUSH', name: 'Press inclinado con mancuernas', sets: 3, reps: '10-12', notes: 'Ángulo 30-45°' },
  { day: 'DÍA 1 — PUSH', name: 'Aperturas en máquina (pec deck)', sets: 3, reps: '12-15' },
  { day: 'DÍA 1 — PUSH', name: 'Elevaciones laterales en máquina o cable', sets: 3, reps: '12-15', notes: 'Hasta 90°, no más' },
  { day: 'DÍA 1 — PUSH', name: 'Press de tríceps en cable', sets: 4, reps: '10-12' },
  { day: 'DÍA 1 — PUSH', name: 'Skull crushers con mancuernas', sets: 3, reps: '10-12' },
  // PULL
  { day: 'DÍA 2 — PULL', name: 'Remo con barra', sets: 4, reps: '8-10' },
  { day: 'DÍA 2 — PULL', name: 'Remo en máquina o cable (unilateral)', sets: 4, reps: '10-12' },
  { day: 'DÍA 2 — PULL', name: 'Jalón al pecho al frente', sets: 3, reps: '10-12', notes: 'Siempre al pecho, nunca detrás del cuello' },
  { day: 'DÍA 2 — PULL', name: 'Pullover en máquina o cable', sets: 3, reps: '12' },
  { day: 'DÍA 2 — PULL', name: 'Curl de bíceps con barra EZ', sets: 3, reps: '10-12' },
  { day: 'DÍA 2 — PULL', name: 'Curl martillo con mancuernas', sets: 3, reps: '10-12' },
  // LEGS
  { day: 'DÍA 3 — LEGS', name: 'Sentadilla libre o en rack', sets: 5, reps: '6-8' },
  { day: 'DÍA 3 — LEGS', name: 'Prensa de piernas', sets: 4, reps: '10-12' },
  { day: 'DÍA 3 — LEGS', name: 'Peso muerto rumano', sets: 4, reps: '10-12' },
  { day: 'DÍA 3 — LEGS', name: 'Extensiones de cuádriceps en máquina', sets: 3, reps: '12-15' },
  { day: 'DÍA 3 — LEGS', name: 'Curl de isquios en máquina', sets: 3, reps: '12-15' },
  { day: 'DÍA 3 — LEGS', name: 'Pantorrillas de pie', sets: 4, reps: '15-20' },
  // FULL BODY
  { day: 'DÍA 4 — FULL BODY', name: 'Peso muerto convencional', sets: 5, reps: '4-6', notes: 'Carga máxima, base de fuerza' },
  { day: 'DÍA 4 — FULL BODY', name: 'Hip thrust', sets: 4, reps: '8-10' },
  { day: 'DÍA 4 — FULL BODY', name: 'Remo pendlay', sets: 3, reps: '6-8', notes: 'Fuerza explosiva' },
  { day: 'DÍA 4 — FULL BODY', name: 'Face pull en cable', sets: 3, reps: '15', notes: 'Rotación mínima, para salud del manguito' },
]

const INITIAL_MEALS: MealPlan = {
  desayuno: '4-5 huevos revueltos o pasados + arroz integral o papa hervida (150g) + fruta (banana o manzana) + café o mate',
  almuerzo: '200-250g pollo/carne/pescado + arroz o papa o batata + verduras + aceite de oliva. Si comés apurado: arroz + atún/sardinas + huevo duro + aceite de oliva.',
  merienda: '2-3 huevos duros + fruta seca o banana',
  cena: 'Similar al almuerzo, más liviana en carbs. Huevos, carne o pescado + verduras + un poco de arroz o papa.',
  extra: 'Yogur natural + frutas secas (antes de dormir si llegás)',
}

export default function TrainerPanel() {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const in15 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(in15)
  const [routine, setRoutine] = useState<PlanExercise[]>(INITIAL_ROUTINE)
  const [meals, setMeals] = useState<MealPlan>(INITIAL_MEALS)
  const [dietNotes, setDietNotes] = useState('Celiaco: todos los alimentos deben ser sin TACC. Sin suplementos ni AINEs. Meta: ~3200-3300 kcal, ~170g proteína.')
  const [activeDay, setActiveDay] = useState(DAYS[0])
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  useEffect(() => { fetchPlans() }, [])

  async function fetchPlans() {
    const { data } = await supabase.from('plans').select('*').order('created_at', { ascending: false }).limit(10)
    if (data) setPlans(data)
    setLoadingPlans(false)
  }

  const dayRoutine = routine.filter(e => e.day === activeDay)

  function updateExercise(idx: number, field: keyof PlanExercise, value: any) {
    const globalIdx = routine.findIndex((e, i) => {
      const dayOnes = routine.filter(r => r.day === activeDay)
      return e === dayOnes[idx]
    })
    if (globalIdx === -1) return
    setRoutine(prev => prev.map((e, i) => i === globalIdx ? { ...e, [field]: value } : e))
  }

  function addExercise() {
    setRoutine(prev => [...prev, { day: activeDay, name: '', sets: 3, reps: '10-12', notes: '' }])
  }

  function removeExercise(idx: number) {
    const dayOnes = routine.filter(r => r.day === activeDay)
    const target = dayOnes[idx]
    setRoutine(prev => prev.filter(e => e !== target))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase.from('plans').insert({
        start_date: startDate,
        end_date: endDate,
        routine: routine.filter(e => e.name.trim()),
        diet_notes: dietNotes,
        meals_plan: meals,
      })
      if (error) throw error
      setSuccess(true)
      fetchPlans()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <Link href="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
        <h1 style={{ fontSize: '1.8rem' }}>PANEL ENTRENADOR</h1>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Cargá el plan de las próximas 2 semanas para Facundo
      </p>

      {/* Period */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>PERÍODO</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div><label>Inicio</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div><label>Fin</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        </div>
      </div>

      {/* Routine editor */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>RUTINA</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '1rem' }}>
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              style={{
                padding: '0.45rem',
                borderRadius: 7,
                border: `2px solid ${activeDay === day ? 'var(--accent)' : 'var(--border)'}`,
                background: activeDay === day ? 'var(--accent-dim)' : 'transparent',
                color: activeDay === day ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontFamily: 'Bebas Neue, sans-serif',
                letterSpacing: '0.04em',
              }}
            >{day}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
          {dayRoutine.map((ex, idx) => (
            <div key={idx} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  value={ex.name}
                  onChange={e => updateExercise(idx, 'name', e.target.value)}
                  placeholder="Nombre del ejercicio"
                  style={{ fontWeight: 600 }}
                />
                <button onClick={() => removeExercise(idx)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <label>Series</label>
                  <input type="number" value={ex.sets} onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value))} min="1" />
                </div>
                <div>
                  <label>Reps</label>
                  <input value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} placeholder="8-10" />
                </div>
              </div>
              <div>
                <label>Notas / restricciones</label>
                <input value={ex.notes || ''} onChange={e => updateExercise(idx, 'notes', e.target.value)} placeholder="Opcional..." />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExercise} className="btn btn-ghost btn-sm">
          <Plus size={14} /> Agregar ejercicio a {activeDay}
        </button>
      </div>

      {/* Diet */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>DIETA</h3>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>Notas generales de dieta</label>
          <textarea value={dietNotes} onChange={e => setDietNotes(e.target.value)} />
        </div>
        {(['desayuno', 'almuerzo', 'merienda', 'cena', 'extra'] as const).map(meal => (
          <div key={meal} style={{ marginBottom: '0.75rem' }}>
            <label style={{ textTransform: 'capitalize' }}>{meal}</label>
            <textarea
              value={meals[meal]}
              onChange={e => setMeals(prev => ({ ...prev, [meal]: e.target.value }))}
              style={{ minHeight: 70 }}
            />
          </div>
        ))}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem', marginBottom: '2rem' }}
      >
        <Save size={18} /> {saving ? 'Guardando...' : success ? '✓ Plan guardado!' : 'GUARDAR PLAN'}
      </button>

      {/* Past plans */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--muted)' }}>PLANES ANTERIORES</h3>
        {loadingPlans && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Cargando...</p>}
        {plans.map(p => {
          const isOpen = expandedPlan === p.id
          return (
            <div key={p.id} className="card" style={{ marginBottom: '0.5rem' }}>
              <div
                onClick={() => setExpandedPlan(isOpen ? null : p.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {new Date(p.start_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    {' → '}
                    {new Date(p.end_date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                    {(p.routine as PlanExercise[]).length} ejercicios cargados
                  </p>
                </div>
                {isOpen ? <ChevronUp size={15} color="var(--muted)" /> : <ChevronDown size={15} color="var(--muted)" />}
              </div>
              {isOpen && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{p.diet_notes}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
