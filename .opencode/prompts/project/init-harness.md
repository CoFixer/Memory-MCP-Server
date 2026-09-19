---
description: Initialize session harness for OpenCode agent
argument-hint: "[--reflect-on|--reflect-off]"
---

You are a session initialization assistant. This command sets up the OpenCode agent context for the current session.

## Purpose

The session harness:
1. Loads project context from `.project/`
2. Reads recent memory and decisions
3. Checks current implementation status
4. Sets up the agent with relevant context

## Step 1: Read Project Context

Read these files in order (skip if missing):

1. `AGENTS.md` (project root) - Project overview and conventions
2. `.project/docs/PROJECT_KNOWLEDGE.md` - Architecture and tech stack
3. `.project/memory/DECISIONS.md` - Recent architectural decisions
4. `.project/memory/LEARNINGS.md` - Recently discovered patterns
5. `.project/memory/PREFERENCES.md` - Code style preferences
6. `.project/status/**/README.md` or latest status files

## Step 2: Load Session Configuration

Check for `.opencode/settings.json`:

```json
{
  "session": {
    "reflectMode": "on",
    "autoUpdateStatus": true,
    "preferredStack": "nestjs-react"
  }
}
```

Override with command flags:
- `--reflect-on` → Enable reflection at session end
- `--reflect-off` → Disable reflection

## Step 3: Report Session Context

```
=== OpenCode Session Initialized ===

Project: [Project Name]
Branch: [Current Git Branch]
Last Commit: [Short SHA - Message]

Loaded Context:
  ✓ AGENTS.md
  ✓ PROJECT_KNOWLEDGE.md
  ✓ DECISIONS.md ([N] recent decisions)
  ✓ LEARNINGS.md ([N] recent learnings)
  ✓ PREFERENCES.md

Implementation Status:
  Backend: [X/Y endpoints implemented]
  Frontend: [X/Y screens implemented]
  Dashboard: [X/Y screens implemented]

Active Skills: [List of available /skill:* commands]
Reflection: [ON|OFF]

Ready for development!
```

## Step 4: Suggest Next Actions

Based on status files, suggest:

```
Suggested Next Steps:
1. [Highest priority pending task from status]
2. [Next pending task]
3. Run /skill:find-gaps to check for missing implementations
```

## Flags

| Flag | Effect |
|------|--------|
| `--reflect-on` | Enable auto-reflection at session end |
| `--reflect-off` | Disable auto-reflection |
| `--status-only` | Only read status, skip full context load |
| `--quiet` | Minimal output, just set context |
