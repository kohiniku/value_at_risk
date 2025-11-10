# Value at Risk Dashboard Prototype

Next.js 14 + Tailwind CSS dashboard that consumes the FastAPI backend to visualise Value at Risk insights.

## Getting Started

```bash
cd frontend
pnpm install
pnpm dev
```

By default the app queries `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`). If the API is offline the UI falls back to sample data so you can still demo the flow.
When running under Docker Compose the env var should be set to `/api/v1` so browser requests are routed through the nginx gateway.

### Scripts

- `pnpm dev` – start Next.js dev server
- `pnpm build` / `pnpm start` – production build & serve
- `pnpm lint` – run ESLint
- `pnpm test` – execute Vitest + Testing Library unit tests

## Testing

A starter test (`tests/SummaryCards.spec.ts`) ensures the component layer is covered out of the gate. Extend coverage for data fetching hooks and interactive flows as features land.

## Styling & Components

- Tailwind CSS with design tokens specified in `DESIGN.md`
- Reusable primitives in `components/ui`
- Dashboard sections in `components/dashboard`
- Theme toggling handled by `useTheme` hook (`hooks/useTheme.ts`)

## Data Flow

Client components fetch from the API using the public env vars. Requests gracefully degrade to mocked data (`lib/sample-data.ts`) to keep the prototype interactive.

## Docker

The top-level `docker-compose.yml` builds the Next.js image and exposes it on port `3000` (with nginx serving traffic on port `80`). Rebuild with:

```bash
docker compose build frontend
```
