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

Alternatively run the full stack (backend, frontend, nginx reverse proxy) via Docker Compose:

```bash
docker compose up --build
```

This exposes:

- http://localhost:80 – Next.js frontend served through nginx
- http://localhost:80/api/v1 – FastAPI endpoints proxied by nginx
- http://localhost:3000 – Next.js service (bypassing nginx)
- http://localhost:8000 – FastAPI service (bypassing nginx)

> For the proxied setup, set `NEXT_PUBLIC_API_BASE_URL=/api/v1` so the browser uses the nginx gateway.

## Testing

- Backend: `uv run python -m unittest backend.tests.test_var_api`
- Frontend: `pnpm test`

Following the TDD requirement, both stacks ship with an initial test to anchor future work. Expand the suites alongside new features.

## Next Steps

- Replace mocked data with database-backed services (SQLite for prices, DynamoDB for news).
- Add authentication and role-based access as the product scope grows.
- Flesh out E2E flows (Playwright/Cypress) once critical flows are defined.

Refer to `AGENTS.md` and `DESIGN.md` for stack choices, conventions, and design tokens.
