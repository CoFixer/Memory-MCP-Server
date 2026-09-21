# OpenCode MCP Integration Guide

> Connect your Memory MCP Server to OpenCode for persistent, context-aware AI coding assistance.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Connection Methods](#connection-methods)
   - [Method A: Local Development (Direct)](#method-a-local-development-direct)
   - [Method B: Remote Server (Recommended)](#method-b-remote-server-recommended)
   - [Method C: Docker Compose (Self-Hosted)](#method-c-docker-compose-self-hosted)
4. [OpenCode Configuration](#opencode-configuration)
5. [API Key Setup](#api-key-setup)
6. [Project Identification](#project-identification)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

OpenCode connects to your Memory MCP Server via **MCP Streamable HTTP**. Once connected:

- OpenCode automatically retrieves project context when you start coding
- Decisions and rules persist across sessions
- Token usage is optimized (only relevant context is sent)
- Multiple computers can share the same project knowledge

```text
┌─────────────┐     MCP/HTTPS      ┌─────────────────────┐
│  OpenCode   │ ◄────────────────► │  Memory MCP Server  │
│  (Client)   │   Bearer Token     │   (NestJS + PG +    │
│             │                    │     Redis)          │
└─────────────┘                    └─────────────────────┘
```

---

## Prerequisites

- Memory MCP Server running (locally or remotely)
- PostgreSQL + pgvector enabled
- Redis running
- OpenCode installed
- Valid API key from the MCP server

---

## Connection Methods

### Method A: Local Development (Direct)

Best for: Developing the MCP server itself or local-only usage.

**1. Start the backend locally:**

```bash
cd backend
pnpm install
pnpm run migration:run
pnpm run start:dev
```

**2. Create an API key via REST API:**

```bash
curl -X POST http://localhost:3000/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenCode Local Dev",
    "permissions": ["memory:read", "memory:write", "project:read", "prd:read"]
  }'
```

> **Note:** First create an admin user via `/api/v1/auth/setup-admin` if no users exist.

**3. Configure OpenCode:**

Create `opencode.json` in your **project root** (the project you want AI assistance for):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer mem_live_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

---

### Method B: Remote Server (Recommended)

Best for: Team usage, multiple computers, persistent 24/7 access.

**1. Deploy the MCP server to a VPS or Dokploy:**

```bash
# Example Dokploy deployment
git push dokploy main
```

**2. Ensure HTTPS is enabled** (Cloudflare, Let's Encrypt, or Traefik).

**3. Create an API key:**

```bash
curl -X POST https://memory.yourdomain.com/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenCode Workstation",
    "permissions": ["memory:read", "memory:write", "project:read", "prd:read"]
  }'
```

**4. Configure OpenCode globally** (applies to all projects):

Create or edit `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "https://memory.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer mem_live_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

**5. Per-project override** (optional):

If a specific project needs different settings, create `opencode.json` in that project's root. It will override the global config for that project only.

---

### Method C: Docker Compose (Self-Hosted)

Best for: Local network sharing or homelab setups.

**1. Use the provided `docker-compose.yml`:**

```yaml
version: "3.8"

services:
  postgres:
    image: ankane/pgvector:latest
    environment:
      POSTGRES_USER: memory_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: memory_db
    volumes:
      - memory-postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - memory-redis-data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://memory_user:${POSTGRES_PASSWORD}@postgres:5432/memory_db
      REDIS_URL: redis://redis:6379
      MCP_BASE_URL: http://localhost:3000
      API_KEY_SECRET: ${API_KEY_SECRET}
      JWT_SECRET: ${JWT_SECRET}
      EMBEDDING_PROVIDER: ollama
      EMBEDDING_MODEL: nomic-embed-text
      EMBEDDING_BASE_URL: http://host.docker.internal:11434
    depends_on:
      - postgres
      - redis

volumes:
  memory-postgres-data:
  memory-redis-data:
```

**2. Run:**

```bash
docker-compose up -d
docker-compose exec backend npx typeorm-ts-node-commonjs migration:run -d ./src/database/data-source.ts
```

**3. Configure OpenCode:**

```json
{
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer mem_live_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

---

## OpenCode Configuration

### Full `opencode.json` Example

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "https://memory.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer mem_live_xxxxxxxxxxxxxxxx"
      }
    }
  },
  "settings": {
    "context": {
      "max_tokens": 4000
    }
  }
}
```

### Configuration Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `~/.config/opencode/opencode.json` | Global (all projects) | Low |
| `./opencode.json` (project root) | Project-specific | High |
| `./.opencode/opencode.json` | Alternative project path | High |

### Environment Variable Substitution

OpenCode supports env variables in config:

```json
{
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "${MCP_SERVER_URL}",
      "headers": {
        "Authorization": "Bearer ${MCP_API_KEY}"
      }
    }
  }
}
```

Set in your shell:

```bash
export MCP_SERVER_URL=https://memory.yourdomain.com/mcp
export MCP_API_KEY=mem_live_xxxxxxxxxxxxxxxx
```

---

## API Key Setup

### Creating an API Key

**Via Dashboard:**
1. Log in to your Memory MCP Server dashboard (`https://memory.yourdomain.com/dashboard`)
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Select permissions: `memory:read`, `memory:write`, `project:read`, `prd:read`
5. Copy the key (shown only once)

**Via REST API:**

```bash
curl -X POST https://memory.yourdomain.com/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "OpenCode Desktop",
    "permissions": ["memory:read", "memory:write", "project:read", "prd:read"]
  }'
```

**Response:**

```json
{
  "id": "uuid-here",
  "name": "OpenCode Desktop",
  "prefix": "mem_live",
  "key": "mem_live_xxxxxxxxxxxxxxxx",
  "permissions": ["memory:read", "memory:write", "project:read", "prd:read"]
}
```

> **IMPORTANT:** Save the `key` immediately. It is shown only once.

### API Key Permissions

| Permission | Description |
|------------|-------------|
| `memory:read` | Retrieve memories and context |
| `memory:write` | Create and update memories |
| `memory:delete` | Delete memories |
| `project:read` | Read project information |
| `prd:read` | Read PRD documents and requirements |

For OpenCode, you typically need: `memory:read`, `memory:write`, `project:read`, `prd:read`

---

## Project Identification

The MCP server identifies projects using the following resolution order:

1. **Explicit project ID** passed in MCP tool arguments
2. **Normalized Git remote** (`git remote -v` output transformed)
3. **Repository URL** from project settings
4. **Project slug** as fallback

### Git Remote Normalization

```text
Input:  git@github.com:company/storepilot.git
Output: github.com/company/storepilot

Input:  https://github.com/company/storepilot.git
Output: github.com/company/storepilot
```

### Ensure Proper Project Matching

**Option 1: Set Git remote correctly**

```bash
git remote add origin git@github.com:your-org/your-project.git
```

**Option 2: Create project with matching Git remote in dashboard**

When creating a project, enter the exact Git remote URL.

**Option 3: Use explicit project identifier in queries**

When OpenCode calls MCP tools, it can pass the project identifier explicitly:

```json
{
  "project": "github.com/your-org/your-project",
  "task": "Implement user authentication"
}
```

---

## Best Practices

### 1. Use Per-Project API Keys

Create separate API keys for different projects or workstations:

```bash
# Key for work laptop
curl ... -d '{"name": "OpenCode Work Laptop"}'

# Key for personal laptop
curl ... -d '{"name": "OpenCode Personal Laptop"}'
```

This allows you to revoke one without affecting the other.

### 2. Set Appropriate Token Budgets

Don't use unlimited context. Set `max_tokens` based on your LLM:

| LLM | Recommended `max_tokens` |
|-----|-------------------------|
| GPT-4o | 4000-8000 |
| GPT-4o-mini | 2000-4000 |
| Claude 3.5 Sonnet | 4000-8000 |
| Local models (7B) | 1000-2000 |

### 3. Store Memories Proactively

After making architectural decisions, explicitly save them:

```
You: "Remember that we decided to use BullMQ for all queues."

OpenCode → MCP: add_memory {
  "content": "All background jobs must use BullMQ with Redis.",
  "type": "decision",
  "scope": "project",
  "importance": 9
}
```

### 4. Use Global Memories for Cross-Project Rules

Save organization-wide conventions as global memories:

```json
{
  "content": "All NestJS projects must use class-validator DTOs.",
  "type": "convention",
  "scope": "global",
  "importance": 8
}
```

### 5. Regularly Review and Update

- Remove outdated memories (soft delete via dashboard)
- Update importance scores as priorities change
- Archive old PRD versions when they are superseded

### 6. Secure Your Deployment

- Always use HTTPS in production
- Rotate API keys every 90 days
- Never commit API keys to Git
- Use `mem_live_` prefix to distinguish from JWT tokens

### 7. Backup Strategy

```bash
# Backup PostgreSQL
docker exec memory-postgres pg_dump -U memory_user memory_db > backup.sql

# Backup Redis (if AOF enabled, just copy the file)
docker cp memory-redis:/data/appendonly.aof ./redis-backup.aof
```

---

## Troubleshooting

### "Invalid API key" Error

**Causes:**
- Key was revoked
- Key expired
- Wrong header format (must be `Bearer mem_live_...`)
- Server `API_KEY_SECRET` changed (invalidates all keys)

**Fix:**
1. Verify key in dashboard
2. Regenerate if needed
3. Ensure header is exactly: `Authorization: Bearer mem_live_xxxxx`

### "Project not found" Error

**Causes:**
- Git remote doesn't match any project
- Project was deleted
- User doesn't have access

**Fix:**
1. Check `git remote -v` output
2. Create project in dashboard with matching Git remote
3. Verify user is assigned to the project

### MCP Tools Not Appearing in OpenCode

**Causes:**
- MCP server URL is incorrect
- Server is down
- CORS blocking requests
- Network/firewall issues

**Fix:**
1. Test MCP endpoint:
   ```bash
   curl -X POST https://memory.yourdomain.com/mcp \
     -H "Authorization: Bearer mem_live_xxxxx" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
   ```
2. Check server logs: `docker logs memory-mcp-server`
3. Verify CORS origins in `.env` (`ALLOW_ORIGINS`)
4. Check firewall rules for port 3000

### Slow Context Retrieval

**Causes:**
- No Redis cache
- Large memory corpus without good indexing
- Embedding provider is slow

**Fix:**
1. Ensure Redis is running and connected
2. Check embedding provider latency (Ollama local vs OpenAI)
3. Increase `CACHE_TTL` in environment
4. Archive old/unused memories

### Conflicts Between Memory and PRD

**Expected behavior:** The MCP server surfaces conflicts instead of silently overriding.

Example response:
```json
{
  "conflicts": [
    {
      "type": "memory_vs_prd",
      "prd_requirement": "Use TypeORM for database access.",
      "memory": "We migrated from TypeORM to Prisma on 2024-01-15."
    }
  ]
}
```

**Resolution:**
1. Update the PRD to reflect the new decision
2. Mark the old memory as superseded
3. Store the new decision with high importance

---

## Advanced Configuration

### Multiple MCP Servers

You can connect multiple MCP servers to OpenCode:

```json
{
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "https://memory.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer mem_live_xxxxx"
      }
    },
    "github": {
      "type": "remote",
      "url": "https://api.github.com/mcp",
      "headers": {
        "Authorization": "Bearer ghp_xxxxx"
      }
    }
  }
}
```

### Custom Headers

If your deployment requires additional headers:

```json
{
  "mcp": {
    "memory": {
      "type": "remote",
      "url": "https://memory.yourdomain.com/mcp",
      "headers": {
        "Authorization": "Bearer mem_live_xxxxx",
        "X-Custom-Header": "value"
      }
    }
  }
}
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] Server health check passes: `GET /health/ready`
- [ ] API key authentication works
- [ ] MCP `tools/list` returns tools
- [ ] `get_context` returns memories for a query
- [ ] `add_memory` stores a new memory
- [ ] Project is identified correctly from Git remote
- [ ] Context respects `max_tokens` limit
- [ ] Dashboard loads at `/dashboard`
- [ ] Memories persist after server restart

---

## Support

- **Documentation**: Check `README.md` and PRD specification
- **Issues**: GitHub Issues for this repository
- **MCP Protocol**: https://modelcontextprotocol.io

---

> **Pro Tip:** Start with a small project, store 5-10 key memories, and test context retrieval before scaling to large PRDs. This helps you understand how the token budget and ranking work.
