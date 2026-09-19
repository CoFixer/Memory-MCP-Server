# Project Facts — Verified Structure

> This file contains VERIFIED facts about the project structure.
> Agents MUST read this file before making assumptions about paths, patterns, or conventions.
> Last verified: 2026-05-16

---

## Backend (`backend/src/`)

### Base Classes (verified)
- `BaseEntity` → `backend/src/core/base/base.entity.ts` (NOT `core/entities/`)
- `BaseController` → `backend/src/core/base/base.controller.ts`
- `BaseService` → `backend/src/core/base/base.service.ts`
- `BaseRepository` → `backend/src/core/base/base.repository.ts`
- All exported from `backend/src/core/base/index.ts`

### Decorators (verified)
- `@Public()` exists at `backend/src/core/decorators/public.decorator.ts`
- `@Roles()` exists at `backend/src/core/decorators/roles.decorator.ts`
- `@One()` does NOT exist
- `@CurrentUser()` exists
- `@ApiResponseData()` exists
- `@Language()` exists

### Project Structure
```
backend/src/
├── core/
│   ├── base/ (base.controller, base.service, base.repository, base.entity, index)
│   ├── decorators/ (api-response-data, api-swagger, current-user, index, language, public, roles)
│   ├── filters/ (http-exception.filter, index)
│   ├── guards/ (index, jwt-auth.guard, jwt.strategy, roles.guard)
│   ├── interceptors/ (index, logging, remove-token, set-token, transform)
│   ├── middleware/ (cors.middleware, index)
│   ├── pipes/ (index, validation.pipe)
│   └── utils/ (date.util, i18n.helper, index, password.util)
├── modules/
│   ├── auth/ (controller, module, service, dtos/)
│   ├── features/ (controller, entity, repository, service, module, dtos/)
│   ├── otp/ (controller, entity, module, service, dtos/)
│   └── users/ (controller, module, service, repository, entity, dtos/)
├── shared/
│   ├── constants/
│   ├── dtos/ (pagination, response, email-option)
│   ├── enums/
│   ├── interfaces/
│   └── templates/
├── database/ (migrations/, seeders/)
├── infrastructure/ (logging, mail, s3, token, utils)
└── config/ (db, jwt, mail, s3, static-data, env-config)
```

### Key Config
- Soft delete: YES via `@DeleteDateColumn({ name: 'deleted_at' })`
- UUID primary keys: YES
- ConfigService: YES, use instead of `process.env`
- API prefix: `/api` (set via `app.setGlobalPrefix('api')` in `main.ts`)
- URI versioning: enabled with `defaultVersion: '1'`
- Auth endpoints use `@Version(VERSION_NEUTRAL)` → accessible at both `/api/auth/...` and `/api/v1/auth/...`
- Standard CRUD endpoints default to `/api/v1/...`

---

## Frontend (`frontend/`)

### Important Paths (verified)
- Types: `frontend/app/types/*.d.ts` (NOT `frontend/types/`)
- Redux: `frontend/app/redux/features/` (NOT `frontend/redux/`)
- Services: `frontend/app/services/httpServices/` (NOT `frontend/services/`)
- Utils: `frontend/app/utils/` (YES)
- Components: `frontend/app/components/` (YES)
- Pages: `frontend/app/pages/` (NOT `frontend/app/routes/`)

### Tailwind
- Version: v4
- NO `tailwind.config.*` file — configuration is CSS-based in `frontend/app/styles/app.css`

### Project Structure
```
frontend/app/
├── components/ (auth/, layout/, ui/, Counter.tsx, error-boundary.tsx)
├── pages/ (auth/, dashboard/, home.tsx, layout.tsx, public/)
├── redux/ (features/, store/)
├── services/ (httpMethods/, httpServices/, httpService.ts, index.ts)
├── types/ (api.d.ts, user.d.ts)
├── utils/ (actions/, errorHandler.ts, validations/)
├── routes/ (auth.routes.ts, protected.routes.ts, public.routes.ts, routes.ts)
├── hooks/ (providers/)
├── lib/ (queryClient.ts, utils.ts)
├── config/ (app.config.ts)
└── styles/ (app.css, typography.css)
```

---

## OpenCode Config (`.opencode/`)

### Guides (verified)
- Backend guides: `.opencode/backend/guides/` (NOT `.opencode/nestjs/guides/`)
- Frontend guides: `.opencode/frontend/guides/` (NOT `.opencode/react/guides/`)
- Mobile guides: `.opencode/mobile/guides/` (NOT `.opencode/react-native/guides/`)

### Agents
- Registry: `.opencode/agents/agent-registry.json`
- Agent files: `.opencode/agents/{category}/{name}.md`

### Skills
- Skill files: `.opencode/skills/{name}/SKILL.md`
- Skill rules: `.opencode/skills/skill-rules.json`

---

## Docker/Infrastructure (verified)

- `docker-compose.yml` exists at project root
- `.dockerignore` exists in backend/ and frontend/
- NO `Dockerfile` exists anywhere
- NO CI/CD config files exist
