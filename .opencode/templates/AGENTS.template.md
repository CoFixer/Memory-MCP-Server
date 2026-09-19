# {PROJECT_NAME} — Agent Context

> Stack: {BACKEND} + {FRONTENDS} | Updated: {DATE}

---

## Quick Reference

| Layer | Tech | Port |
|-------|------|------|
| Backend | {BACKEND} | {BACKEND_PORT} |
| Frontend | React 19 | 5173 |
| Database | PostgreSQL | 5432 |
| Cache | Redis | 6379 |

---

## Structure

```
{PROJECT_NAME}/
├── backend/          # {BACKEND} API
├── frontend/         # React 19 web app
├── .opencode/        # OpenCode config
├── .project/         # Project docs & state
└── docker-compose.yml
```

---

## Commands

```bash
# Start infra
docker-compose up -d postgres redis

# Start backend
cd backend && npm run start:dev

# Start frontend
cd frontend && npm run dev
```

---

## Patterns

- **Backend**: Modular architecture, DTO validation, JWT auth guards, Swagger docs, Repository pattern
- **Frontend**: React Router 7 loaders (SSR), TanStack Query (public pages), Redux Toolkit (dashboard/auth state), Tailwind + shadcn/ui
- **Auth**: AES-256-GCM encrypted JWT in httpOnly cookies + CSRF Double-Submit Cookie

---

## Conventions

- Commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Branches: `main`, `dev`, `feature/*`, `fix/*`
- API responses: `{ success, data, message }` or `{ success, error }`

---

## Key Docs

| File | Purpose |
|------|---------|
| `.project/docs/PROJECT_KNOWLEDGE.md` | Architecture, features, stack |
| `.project/docs/PROJECT_API.md` | API endpoints |
| `.project/docs/PROJECT_DATABASE.md` | DB schema & ERD |
| `.project/PROJECT_FACTS.md` | Verified project structure |

---

## Skills

| Command | Purpose |
|---------|---------|
| `/skill:feature` | Feature development |
| `/skill:commit` | Git commit workflow |
| `/skill:find-gaps` | Find implementation gaps |
| `/skill:fix-gaps` | Fix gaps |
| `/skill:review` | Code review |
| `/skill:generate-docs` | Generate docs |
| `/skill:crud-module-generator` | Generate NestJS CRUD |
| `/skill:api-contract-designer` | Design API contracts |
| `/skill:security-checklist` | Security audit |
| `/skill:performance-audit` | Performance review |
