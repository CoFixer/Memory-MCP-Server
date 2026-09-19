# Memory MCP Server

[![NestJS](https://img.shields.io/badge/NestJS-12-red?logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue?logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-red?logo=redis)](https://redis.io)
[![MCP](https://img.shields.io/badge/MCP-Streamable_HTTP-green)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Self-hosted AI memory infrastructure for coding agents.**
>
> Persistent memory across OpenCode sessions using the Model Context Protocol (MCP).

---

## What is Memory MCP Server?

Memory MCP Server is a self-hosted persistent memory service for AI coding agents like **OpenCode**.

Instead of repeatedly telling an AI agent:
- "This project uses NestJS."
- "We use TypeORM."
- "PostgreSQL is the main database."
- "Never use Prisma."
- "API endpoints must use `/api/v1`."

The MCP server stores these facts permanently and retrieves the relevant information when the agent needs it.

```text
OpenCode / Any MCP Client
         │
         │ MCP / HTTPS
         ▼
 https://memory.yourdomain.com/mcp
         │
         ▼
┌───────────────────────────────┐
│ NestJS Memory MCP Server      │
│                               │
│ Authentication                │
│ MCP Tools                     │
│ Memory Engine                 │
│ Context Engine                │
│ Search Engine                 │
│ Embedding Service             │
│ Project Management            │
└───────────────┬───────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
 PostgreSQL +        Redis
 pgvector
```

---

## Key Features

- **Persistent AI Memory** - Remember project facts, rules, and decisions across sessions
- **Global & Project Scopes** - Global memories apply everywhere; project memories are context-aware
- **Semantic Search** - pgvector-powered similarity search for conceptually related memories
- **Hybrid Search** - Combines vector similarity + full-text relevance + importance + recency
- **Token Budgeting** - `get_context` respects `max_tokens` and prioritizes critical rules
- **MCP Streamable HTTP** - Standards-compliant MCP endpoint at `POST /mcp`
- **API Key Authentication** - Secure Bearer token auth with scoped permissions
- **Pluggable Embeddings** - OpenAI, Ollama, OpenRouter, or custom providers
- **Memory Deduplication** - Auto-detect and merge similar memories before storing
- **Audit Logging** - Track memory creation, updates, recalls, and API key usage
- **Redis Caching** - Context cache, search cache, auth cache, and rate limiting
- **REST Management API** - Full CRUD for memories, projects, workspaces, and API keys

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | NestJS 12 + TypeScript 6 |
| **Protocol** | Model Context Protocol (MCP) via Streamable HTTP |
| **Database** | PostgreSQL 16+ with pgvector extension |
| **Cache** | Redis 7+ |
| **ORM** | TypeORM |
| **Auth** | API Key (Bearer) + JWT |
| **Embeddings** | OpenAI / Ollama / OpenRouter |
| **Deployment** | Docker / VPS / Dokploy |

---

## Quick Start (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) 24+
- [pnpm](https://pnpm.io/) 10+
- [PostgreSQL](https://www.postgresql.org/) 16+ with `pgvector`
- [Redis](https://redis.io/) 7+
- [Ollama](https://ollama.com/) (for local embeddings, optional)

### 1. Clone & Install

```bash
git clone https://github.com/CoFixer/Memory-MCP-Server.git
cd Memory-MCP-Server/backend
pnpm install
```

### 2. Setup Database

```bash
# Create database
createdb memory_db

# Enable pgvector extension
psql -d memory_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database, Redis, and API key settings
```

### 4. Run Migrations

```bash
pnpm run migration:run
```

### 5. Start Development Server

```bash
pnpm run start:dev
```

The server will be available at `http://localhost:3000`.

---

## VPS Deployment (Docker)

### Architecture

```text
                    Internet
                       │
                       ▼
                  Cloudflare
                       │
                       ▼
                    HTTPS
                       │
                       ▼
                   Traefik
                       │
                       ▼
           memory.yourdomain.com
                       │
                       ▼
            ┌────────────────────┐
            │ NestJS Memory MCP  │
            │       Server       │
            └─────────┬──────────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
        PostgreSQL           Redis
        + pgvector
```

### 1. Provision VPS

Recommended specs:
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended with Ollama)
- **Disk**: 20GB+ SSD
- **OS**: Ubuntu 24.04 LTS

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Create Docker Network

```bash
docker network create memory-network
```

### 4. Start PostgreSQL + pgvector

```bash
docker run -d \
  --name memory-postgres \
  --network memory-network \
  -e POSTGRES_USER=memory_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=memory_db \
  -v memory-postgres-data:/var/lib/postgresql/data \
  -p 127.0.0.1:5432:5432 \
  ankane/pgvector:latest
```

### 5. Start Redis

```bash
docker run -d \
  --name memory-redis \
  --network memory-network \
  -v memory-redis-data:/data \
  -p 127.0.0.1:6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes
```

### 6. Build & Run Backend

```bash
cd /opt/memory-mcp-server/backend

# Build Docker image
docker build -t memory-mcp-server:latest .

# Run container
docker run -d \
  --name memory-mcp-server \
  --network memory-network \
  -p 127.0.0.1:3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=postgresql://memory_user:your_secure_password@memory-postgres:5432/memory_db \
  -e REDIS_URL=redis://memory-redis:6379 \
  -e MCP_BASE_URL=https://memory.yourdomain.com \
  -e API_KEY_SECRET=your-super-secret-api-key-secret-min-32-chars-long \
  -e JWT_SECRET=your-super-secret-jwt-secret-min-32-chars-long \
  -e EMBEDDING_PROVIDER=ollama \
  -e EMBEDDING_MODEL=nomic-embed-text \
  -e EMBEDDING_BASE_URL=http://host.docker.internal:11434 \
  -e EMBEDDING_DIMENSIONS=768 \
  -e MEMORY_DEFAULT_LIMIT=20 \
  -e MEMORY_CONTEXT_MAX_TOKENS=5000 \
  -e CACHE_TTL=300 \
  -e RATE_LIMIT_TTL=60 \
  -e RATE_LIMIT_MAX=100 \
  -e LOG_LEVEL=info \
  --restart unless-stopped \
  memory-mcp-server:latest
```

### 7. Run Migrations

```bash
docker exec memory-mcp-server \
  npx typeorm-ts-node-commonjs migration:run -d ./src/database/data-source.ts
```

### 8. Setup Reverse Proxy (Traefik / Nginx)

#### Traefik (Recommended with Docker)

```yaml
# docker-compose.yml
version: "3.8"

networks:
  memory-network:
    external: true
  traefik-network:
    external: true

services:
  postgres:
    image: ankane/pgvector:latest
    container_name: memory-postgres
    networks:
      - memory-network
    environment:
      POSTGRES_USER: memory_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: memory_db
    volumes:
      - memory-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U memory_user -d memory_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: memory-redis
    networks:
      - memory-network
    volumes:
      - memory-redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: memory-mcp-server
    networks:
      - memory-network
      - traefik-network
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://memory_user:${POSTGRES_PASSWORD}@postgres:5432/memory_db
      REDIS_URL: redis://redis:6379
      MCP_BASE_URL: https://memory.yourdomain.com
      API_KEY_SECRET: ${API_KEY_SECRET}
      JWT_SECRET: ${JWT_SECRET}
      EMBEDDING_PROVIDER: ${EMBEDDING_PROVIDER}
      EMBEDDING_MODEL: ${EMBEDDING_MODEL}
      EMBEDDING_BASE_URL: ${EMBEDDING_BASE_URL}
      EMBEDDING_DIMENSIONS: ${EMBEDDING_DIMENSIONS}
      MEMORY_DEFAULT_LIMIT: 20
      MEMORY_CONTEXT_MAX_TOKENS: 5000
      CACHE_TTL: 300
      RATE_LIMIT_TTL: 60
      RATE_LIMIT_MAX: 100
      LOG_LEVEL: info
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.memory.rule=Host(`memory.yourdomain.com`)"
      - "traefik.http.routers.memory.entrypoints=websecure"
      - "traefik.http.routers.memory.tls.certresolver=letsencrypt"
      - "traefik.http.services.memory.loadbalancer.server.port=3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  memory-postgres-data:
  memory-redis-data:
```

#### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name memory.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot
sudo certbot --nginx -d memory.yourdomain.com
```

---

## OpenCode Integration

OpenCode connects to your Memory MCP Server via MCP Streamable HTTP.

### Configure OpenCode

Add the MCP server to your OpenCode configuration. Create or edit `opencode.json` in your project root:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "https://memory.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Or for global configuration, add to `~/.config/opencode/opencode.json`.

### Generate API Key

```bash
curl -X POST https://memory.yourdomain.com/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenCode Workstation",
    "permissions": ["memory:read", "memory:write", "project:read"]
  }'
```

### How It Works

1. **OpenCode requests context** when you start a new task
2. **Server identifies project** from Git remote (`github.com/company/storepilot`)
3. **Retrieves relevant memories** - rules, decisions, architecture, preferences
4. **Returns optimized context** within token budget
5. **New memories are stored** automatically when you make decisions

### Example Workflow

```text
You: "Create a payment retry queue."

OpenCode → MCP Server:
  "get_context": {
    "query": "payment retry queue",
    "project": "github.com/company/storepilot"
  }

Server Returns:
  - NestJS backend
  - Redis available
  - BullMQ required for jobs
  - Queue names kebab-case
  - Retry policy = exponential
  - Maximum attempts = 5

You implement the feature...

OpenCode → MCP Server:
  "remember_decision": {
    "content": "Payment retries use payment-retry queue.",
    "project": "github.com/company/storepilot"
  }

Future sessions automatically recall this decision.
```

---

## MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `get_context` | Primary retrieval - returns curated relevant memories |
| `add_memory` | Store a new memory with embedding |
| `search_memories` | Hybrid search with filters |
| `list_memories` | Browse memories with pagination and filters |
| `get_memory` | Retrieve single memory by ID |
| `edit_memory` | Update memory content, type, tags, importance |
| `delete_memory` | Soft delete a memory |
| `get_rules` | Optimized retrieval for rules, conventions, architecture |
| `remember_decision` | Convenience tool for architectural decisions |

### Example: `get_context`

```json
{
  "query": "implement notification queue",
  "project": "github.com/company/storepilot",
  "max_tokens": 4000
}
```

### Example: `add_memory`

```json
{
  "content": "Notification jobs use BullMQ.",
  "type": "decision",
  "scope": "project",
  "project": "github.com/company/storepilot",
  "importance": 8
}
```

---

## REST Management API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/memories` | Create memory |
| `GET` | `/api/v1/memories` | List memories |
| `GET` | `/api/v1/memories/:id` | Get memory |
| `PATCH` | `/api/v1/memories/:id` | Update memory |
| `DELETE` | `/api/v1/memories/:id` | Delete memory |
| `GET` | `/api/v1/projects` | List projects |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/workspaces` | List workspaces |
| `POST` | `/api/v1/workspaces` | Create workspace |
| `GET` | `/api/v1/api-keys` | List API keys |
| `POST` | `/api/v1/api-keys` | Create API key |
| `DELETE` | `/api/v1/api-keys/:id` | Revoke API key |

Full API documentation available at `/api/docs` (Swagger UI) when running.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | HTTP server port |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `REDIS_URL` | - | Redis connection string |
| `MCP_BASE_URL` | - | Public URL for MCP endpoint |
| `API_KEY_SECRET` | - | Secret for API key hashing (min 32 chars) |
| `JWT_SECRET` | - | Secret for JWT signing (min 32 chars) |
| `EMBEDDING_PROVIDER` | `ollama` | `ollama` / `openai` / `openrouter` |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Model name for embeddings |
| `EMBEDDING_BASE_URL` | - | Provider base URL |
| `EMBEDDING_DIMENSIONS` | `768` | Vector dimensions |
| `MEMORY_DEFAULT_LIMIT` | `20` | Default search result limit |
| `MEMORY_CONTEXT_MAX_TOKENS` | `5000` | Default token budget for context |
| `CACHE_TTL` | `300` | Redis cache TTL in seconds |
| `RATE_LIMIT_TTL` | `60` | Rate limit window in seconds |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Logging level |

---

## Database Migrations

```bash
# Generate migration
pnpm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

---

## Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | General health status |
| `GET /health/ready` | Ready for traffic (DB + Redis + embeddings) |
| `GET /health/live` | Liveness probe |

---

## Project Structure

```text
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # API Key & JWT authentication
│   │   ├── api-keys/       # API key management
│   │   ├── users/          # User management
│   │   ├── workspaces/     # Workspace management
│   │   ├── projects/       # Project identification
│   │   ├── memories/       # Memory CRUD & deduplication
│   │   ├── search/         # Hybrid search (vector + fulltext)
│   │   ├── embeddings/     # Pluggable embedding providers
│   │   ├── context/        # Context assembly & token budgeting
│   │   ├── mcp/            # MCP protocol endpoint & tools
│   │   ├── cache/          # Redis caching service
│   │   ├── audit/          # Audit logging
│   │   ├── health/         # Health checks
│   │   └── admin/          # Admin dashboard API
│   ├── database/
│   │   ├── entities/       # TypeORM entities
│   │   └── migrations/     # Database migrations
│   └── common/             # Guards, decorators, filters, interceptors
├── Dockerfile
├── .env.example
└── package.json

dashboard/
├── src/                    # React admin dashboard
├── Dockerfile
└── .env.example
```

---

## Security Best Practices

1. **Never expose PostgreSQL or Redis ports publicly** - Keep them on private Docker network
2. **Use strong API_KEY_SECRET and JWT_SECRET** - Minimum 32 random characters
3. **Enable HTTPS only** - Use Cloudflare or Let's Encrypt
4. **Restrict CORS origins** - Set allowed origins in production
5. **Rotate API keys regularly** - Revoke unused keys via REST API
6. **Never commit `.env` files** - Use secrets management in production

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- **Documentation**: [https://memories.sh/docs](https://memories.sh/docs)
- **OpenCode Integration**: [https://memories.sh/docs/integrations/opencode](https://memories.sh/docs/integrations/opencode)
- **Issues**: [GitHub Issues](https://github.com/CoFixer/Memory-MCP-Server/issues)
