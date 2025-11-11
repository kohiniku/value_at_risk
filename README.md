# Value at Risk Prototype Workspace

This repository hosts the first prototype for the Value at Risk dashboard initiative. The solution is split into:

- `backend/` – FastAPI service delivering SQLite-backed VaR/newsデータ with automated API checks.
- `frontend/` – Next.js 14 dashboard implementing the dark, card-driven UI described in `DESIGN.md`.

## Development Workflow

1. Copy `.env.example` to `.env` and adjust API endpoints / proxy settings as needed.
2. Boot the backend (inside Docker once available):
   ```bash
   cd backend
   uv sync
   uv run uvicorn app.main:app --reload --port 8000
   ```
3. Start the frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

Both layers use mocked data so you can iterate on the UI before wiring real data sources.

### Containerised setup

Alternatively run the full stack (backend, frontend, nginx reverse proxy) via Docker Compose. The default compose file now mounts your local source directories into the containers so code changes are reflected immediately without rebuilding images:

```bash
# first run installs dependencies and seeds the DB
docker compose up backend frontend nginx
```

On subsequent edits just refresh the browser (backend uses `uvicorn --reload`, frontend runs `pnpm dev`). The command exposes:

- http://localhost:80 – Next.js frontend served through nginx
- http://localhost:80/api/v1 – FastAPI endpoints proxied by nginx
- http://localhost:8000 – FastAPI service (bypassing nginx, useful for debugging)

> When running behind nginx the default `NEXT_PUBLIC_API_BASE_URL=/api/v1` already routes requests through the reverse proxy. Override it (e.g. `http://localhost:8000/api/v1`) only when bypassing nginx during local debugging.

Node dependencies are stored inside the named volume `value_at_risk_frontend_node_modules`. Remove it if you need a clean install:

```bash
docker compose down -v
```

## Testing

- Backend: `uv run python -m unittest backend.tests.test_var_api`
- Frontend: `pnpm test`

Following the TDD requirement, both stacks ship with an initial test to anchor future work. Expand the suites alongside new features.

## Next Steps

- Replace mocked data with database-backed services (SQLite for prices, DynamoDB for news).
- Add authentication and role-based access as the product scope grows.
- Flesh out E2E flows (Playwright/Cypress) once critical flows are defined.

Refer to `AGENTS.md` and `DESIGN.md` for stack choices, conventions, and design tokens.
