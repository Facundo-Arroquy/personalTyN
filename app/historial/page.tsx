'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { GymSession, GymExercise, FoodLog, SetLog } from '@/lib/supabase'
import { ArrowLeft, Dumbbell, Utensils, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

const FEELING_LABEL: Record<string, { label: string; cls: string }> = {
  sobrado: { label: '💪 Sobrado', cls: 'tag-green' },
  bien: { label: '✅ Bien', cls: 'tag-blue' },
  muy_cansado: { label: '😮‍💨 Cansado', cls: 'tag-red' },
}

const MEAL_EMOJI: Record<string, string> = {
  desayuno: '🌅',
  almuerzo: '☀️',
  merienda: '🍵',
  cena: '🌙',
  extra: '🍎',
}

function SessionCard({ session }: { session: GymSession & { exercises?: GymExercise[] } }) {
  const [open, setOpen] = useState(false)
  const [exercises, setExercises] = useState<GymExercise[]>(session.exercises || [])
  const [loaded, setLoaded] = useState(!!session.exercises)
  const f = session.feeling ? FEELING_LABEL[session.feeling] : null

  async function loadExercises() {
    if (loaded) { setOpen(!open); return }
    const { data } = await supabase.from('gym_exercises').select('*').eq('session_id', session.id)
    if (data) setExercises(data)
    setLoaded(true)
    setOpen(true)
  }

  const dateStr = new Date(session.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="card" style={{ marginBottom: '0.75rem' }}>
      <div
        onClick={loadExercises}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Dumbbell size={14} color="var(--accent)" />
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{dateStr}</span>
            {f && <span className={`tag ${f.cls}`}>{f.label}</span>}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            {session.time_in}{session.time_out ? ` → ${session.time_out}` : ''}
            {session.notes ? ` · ${session.notes}` : ''}
          </p>
        </div>
        {open ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
      </div>

      {open && exercises.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          {exercises.map(ex => (
            <div key={ex.id} style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.3rem', color: 'var(--accent)', fontSize: '0.9rem' }}>{ex.name}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px,1fr))', gap: '0.3rem' }}>
                {(ex.sets as SetLog[]).map((s: SetLog, i: number) => (
                  <div key={i} style={{
                    background: 'var(--surface2)',
                    borderRadius: 6,
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.78rem',
                    color: 'var(--text)',
                  }}>
                    <span style={{ color: 'var(--muted)' }}>S{s.set_number} </span>
                    <strong>{s.weight}kg</strong>
                    <span style={{ color: 'var(--muted)' }}> × {s.reps}r</span>
                  </div>
                ))}
              </div>
              {ex.notes && <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>{ex.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupFoodByDate(logs: FoodLog[]) {
  const map: Record<string, FoodLog[]> = {}
  for (const log of logs) {
    if (!map[log.date]) map[log.date] = []
    map[log.date].push(log)
  }
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
}

function HistorialContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'gym' | 'dieta'>(searchParams.get('tab') === 'dieta' ? 'dieta' : 'gym')
  const [sessions, setSessions] = useState<GymSession[]>([])
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAll() {
    const [{ data: sess }, { data: food }] = await Promise.all([
      supabase.from('gym_sessions').select('*').order('date', { ascending: false }).limit(30),
      supabase.from('food_logs').select('*').order('date', { ascending: false }).limit(60),
    ])
    if (sess) setSessions(sess)
    if (food) setFoodLogs(food)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [])

  const groupedFood = groupFoodByDate(foodLogs)

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
        <h1 style={{ fontSize: '1.8rem' }}>HISTORIAL</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--surface)', borderRadius: 10, padding: '0.3rem' }}>
        {(['gym', 'dieta'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: 7,
              border: 'none',
              background: tab === t ? 'var(--surface2)' : 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--muted)',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '1.1rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            {t === 'gym' ? <Dumbbell size={15} /> : <Utensils size={15} />}
            {t === 'gym' ? 'GYM' : 'DIETA'}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Cargando...</p>}

      {!loading && tab === 'gym' && (
        <div>
          {sessions.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Sin sesiones registradas todavía</p>}
          {sessions.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}

      {!loading && tab === 'dieta' && (
        <div>
          {groupedFood.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center' }}>Sin comidas registradas todavía</p>}
          {groupedFood.map(([date, logs]) => {
            const dateStr = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
            return (
              <div key={date} style={{ marginBottom: '1.25rem' }}>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{dateStr}</p>
                {logs.map(log => (
                  <div key={log.id} className="card" style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{MEAL_EMOJI[log.meal_type] || '🍽️'}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{log.meal_type}</p>
                      <p style={{ fontSize: '0.9rem' }}>{log.description}</p>
                      {log.notes && <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default function Historial() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--muted)' }}>Cargando...</div>}>
      <HistorialContent />
    </Suspense>
  )
}
