# {PROJECT_NAME}

> Full stack application built with {BACKEND} and {FRONTENDS}.

## Features

- [Feature 1]
- [Feature 2]
- [Feature 3]

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | {BACKEND} |
| Frontend | {FRONTENDS} |
| Database | PostgreSQL |
| Styling | TailwindCSS 4 |
| UI | shadcn/ui |

## Quick Start

```bash
# Start infra
docker-compose up -d postgres redis

# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

## Project Structure

```
{PROJECT_NAME}/
├── backend/        # {BACKEND} API
├── frontend/       # React 19 web app
├── .opencode/      # OpenCode config
├── .project/       # Project docs
└── docker-compose.yml
```

## Development

| Service | Command | URL |
|---------|---------|-----|
| Backend | `cd backend && npm run start:dev` | http://localhost:{BACKEND_PORT} |
| Frontend | `cd frontend && npm run dev` | http://localhost:5173 |
| API Docs | Swagger UI | http://localhost:{BACKEND_PORT}/api/docs |

## Testing

```bash
cd backend && npm test
cd frontend && npm test
```

## Documentation

- [PROJECT_KNOWLEDGE.md](.project/docs/PROJECT_KNOWLEDGE.md) — Architecture & features
- [PROJECT_API.md](.project/docs/PROJECT_API.md) — API reference
- [PROJECT_DATABASE.md](.project/docs/PROJECT_DATABASE.md) — Database schema
- [AGENTS.md](AGENTS.md) — Agent development context
