'use client'
import Link from 'next/link'
import { Dumbbell, Utensils, ClipboardList, BarChart3 } from 'lucide-react'

export default function Home() {
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {today}
        </p>
        <h1 style={{ fontSize: '3rem', lineHeight: 1, marginTop: '0.2rem' }}>FACUNDO<br/>
          <span style={{ color: 'var(--accent)' }}>ARROQUY</span>
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Seguimiento de entrenamiento y nutrición
        </p>
      </div>

      {/* Main actions */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Link href="/gym/nueva-sesion" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'rgba(200,240,77,0.3)', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--accent-dim)', borderRadius: 10, padding: '0.8rem', flexShrink: 0 }}>
              <Dumbbell size={28} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>REGISTRAR SESIÓN</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 400 }}>Cargá la rutina de hoy con pesos y sensaciones</p>
            </div>
          </div>
        </Link>

        <Link href="/dieta/registrar" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'rgba(77,200,240,0.3)', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--blue-dim)', borderRadius: 10, padding: '0.8rem', flexShrink: 0 }}>
              <Utensils size={28} color="var(--blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>REGISTRAR COMIDA</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 400 }}>Desayuno, almuerzo, merienda, cena o extra</p>
            </div>
          </div>
        </Link>

        <Link href="/historial" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.8rem', flexShrink: 0 }}>
              <BarChart3 size={28} color="var(--muted)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>HISTORIAL</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 400 }}>Sesiones, comidas y progresión</p>
            </div>
          </div>
        </Link>

        <Link href="/plan" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.8rem', flexShrink: 0 }}>
              <ClipboardList size={28} color="var(--muted)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>MI PLAN ACTUAL</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 400 }}>Rutina y dieta del período actual</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Trainer access */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <Link href="/trainer" style={{ color: 'var(--muted)', fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Acceso entrenador →
        </Link>
      </div>
    </main>
  )
}
