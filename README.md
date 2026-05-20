# Monitor de Noticias Bolivia

Aplicación web para monitoreo diario de noticias (salud, economía y otros temas) con envío a funcionarios institucionales.

## Requisitos

- Node.js 20+

## Inicio rápido

```bash
npm install
npm run dev
```

La aplicación se abre en `http://localhost:5173` con datos de ejemplo precargados y auto-login.

## Stack

- React 19 + TypeScript + Vite
- React Router v7
- Datos locales con localStorage (no requiere Firebase ni conexión a internet)

## Estructura

- `/src/pages/Login.tsx` — Inicio de sesión
- `/src/pages/Dashboard.tsx` — Panel con estadísticas
- `/src/pages/NewsPage.tsx` — CRUD de noticias
- `/src/pages/DailySummaryPage.tsx` — Resúmenes diarios
- `/src/pages/OfficialsPage.tsx` — Gestión de funcionarios
- `/src/lib/firestore.ts` — Servicios de datos con localStorage
- `/src/contexts/AuthContext.tsx` — Contexto de autenticación

## Construir para producción

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.
