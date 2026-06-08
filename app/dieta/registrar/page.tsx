'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { MealType } from '@/lib/supabase'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

const MEALS: { value: MealType; label: string; emoji: string; color: string }[] = [
  { value: 'desayuno', label: 'Desayuno', emoji: '🌅', color: 'var(--accent)' },
  { value: 'almuerzo', label: 'Almuerzo', emoji: '☀️', color: 'var(--blue)' },
  { value: 'merienda', label: 'Merienda', emoji: '🍵', color: '#f0b84d' },
  { value: 'cena', label: 'Cena', emoji: '🌙', color: '#b04df0' },
  { value: 'extra', label: 'Extra / Snack', emoji: '🍎', color: 'var(--red)' },
]

export default function RegistrarComida() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const now = new Date()
  const [date, setDate] = useState(now.toISOString().split('T')[0])
  const [mealType, setMealType] = useState<MealType>('desayuno')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSave() {
    if (!description.trim()) return alert('Describí qué comiste')
    setSaving(true)
    try {
      const { error } = await supabase.from('food_logs').insert({
        date,
        meal_type: mealType,
        description: description.trim(),
        notes: notes.trim() || null,
      })
      if (error) throw error
      router.push('/historial?tab=dieta')
    } catch (err) {
      console.error(err)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const selectedMeal = MEALS.find(m => m.value === mealType)!

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
        <h1 style={{ fontSize: '1.8rem' }}>REGISTRAR COMIDA</h1>
      </div>

      {/* Date */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <label>Fecha</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {/* Meal type */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <label>Tipo de comida</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
          {MEALS.map(m => (
            <button
              key={m.value}
              onClick={() => setMealType(m.value)}
              style={{
                padding: '0.65rem',
                borderRadius: 8,
                border: `2px solid ${mealType === m.value ? m.color : 'var(--border)'}`,
                background: mealType === m.value ? `${m.color}18` : 'transparent',
                color: mealType === m.value ? m.color : 'var(--muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="card" style={{ marginBottom: '1rem', borderColor: `${selectedMeal.color}30` }}>
        <label>¿Qué comiste en {selectedMeal.label.toLowerCase()}?</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={`Ej: 4 huevos revueltos, arroz integral 150g, café sin azúcar...`}
          style={{ minHeight: 120 }}
        />
      </div>

      {/* Notes */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label>Notas adicionales (opcional)</label>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ej: estaba apurado, comí menos de lo normal..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '1rem' }}
      >
        <Save size={18} /> {saving ? 'Guardando...' : 'GUARDAR COMIDA'}
      </button>
    </main>
  )
}
