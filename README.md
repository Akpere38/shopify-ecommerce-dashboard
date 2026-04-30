# Storefront

A standalone React + Vite ecommerce dashboard with a deep-navy / emerald-green
palette. Manages a fictional store ("Lumen & Co."), products, orders, and a
public storefront link. All data is mocked in-memory — no backend required.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:5173> — the app loads with seed data so every page
looks alive immediately.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run typecheck` — TypeScript check (no emit).

## Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- shadcn/ui components + Radix primitives
- TanStack Query v5
- wouter (routing)
- Recharts (charts)
- React Hook Form + Zod
- Framer Motion, lucide-react, sonner

## Project layout

```
src/
  api/mock.ts        — in-memory mock API + React Query hooks
  pages/             — dashboard, products, product-edit, storefront,
                       settings, public-store, not-found
  components/        — layout + shadcn/ui components
  hooks/             — small reusable hooks
  lib/               — utilities (cn, format)
  index.css          — Tailwind v4 + theme tokens
  App.tsx, main.tsx  — app shell + entry
```

## Wiring a real backend

`src/api/mock.ts` exposes the same hook signatures a real API client would
(`useGetStore`, `useListProducts`, `useCreateProduct`, etc.). Replace each
`queryFn` / `mutationFn` body with a real `fetch` call to your API and the
rest of the app keeps working unchanged.
# shopify-ecommerce-dashboard
