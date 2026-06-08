# 🏋️ Personal Trainer & Nutrición — Facundo Arroquy

App de seguimiento personalizado de entrenamiento y dieta.

## Stack
- **Next.js 15** (App Router)
- **Supabase** (base de datos)
- **Vercel** (deploy)

## Setup local

```bash
# 1. Clonar el repo
git clone https://github.com/Facundo-Arroquy/personalTyN.git
cd personalTyN

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Correr en desarrollo
npm run dev
```

## Base de datos (Supabase)

Ejecutar el contenido de `lib/supabase-schema.sql` en el **SQL Editor** de Supabase.

## Deploy en Vercel

1. Importar el repo desde vercel.com
2. Agregar las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Home — accesos rápidos |
| `/gym/nueva-sesion` | Registrar sesión de gym |
| `/dieta/registrar` | Registrar comida |
| `/historial` | Ver historial de gym y dieta |
| `/plan` | Ver plan actual |
| `/trainer` | Panel del entrenador — cargar nuevos planes |
