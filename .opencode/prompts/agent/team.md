---
description: Launch multi-agent orchestration with composable modes (team/parallel/solo/ticket)
argument-hint: "<mode> [--task <desc>] [--prd <path>] [--project <name>] [--status <filter>] [--sprint <name>] [--split-dev] [--autopilot] [--agents <list>] [--stop] [--status]"
---

# /team

Launch agents with the right coordination pattern. Each mode composes agents from the registry into a team, parallel workers, solo specialist, or ticket-driven fixer.

## Quick Start

```bash
# Team mode: PM + Dev(s) + QA continuous loop
/team team --prd .project/prd/my-app-prd.md

# Ticket mode: PM + Dev + QA fixing Notion tickets automatically
/team ticket --project "Design Flow"
/team ticket --project "Design Flow" --status "New" --sprint "Sprint 3"
/team ticket --status "New"   # all projects

# Parallel mode: independent agents on separate problems
/team parallel --task "fix auth bug + fix payment form + update user docs"

# Solo mode: single specialist for focused task
/team solo --task "review the user controller"

# Status / Stop (for team and ticket modes)
/team --status
/team --stop
```

---

## Execution Instructions

### Step 1: Parse Arguments

```
mode = $1 (team | parallel | solo | ticket)
task = --task value (task description, used by parallel/solo)
prd = --prd value (PRD file path, used by team)
project = --project value (Notion project name, used by ticket mode, e.g., "Design Flow")
status_filter = --status value (ticket mode: Notion status filter, e.g., "New", "Backlog")
sprint = --sprint value (ticket mode: sprint filter, e.g., "Sprint 3")
split_dev = --split-dev flag (team mode: spawn separate backend + frontend devs)
autopilot = --autopilot flag (team mode: persistent execution with auto-resume)
agents = --agents value (comma-separated agent name overrides)
stop = --stop flag (stop running team/ticket)
status = --status flag (show current status)
```

**Recommend --autopilot for long tasks:**
- If mode is `team` AND `--autopilot` is NOT set:
  - Count estimated backlog items (from PRD complexity)
  - If items > 3, warn: "This looks like a long task. Consider using `--autopilot` for automatic recovery from rate limits and session drops. Continue without autopilot? (y/n)"
  - If user chooses autopilot, add the flag and proceed below

> **Note on `--status` ambiguity:** If the value after `--status` is a known Notion status (`Backlog`, `New`, `In Progress`, `Ready for test`, `Close`), treat it as `status_filter` for ticket mode. If `--status` appears with no value, treat as the display flag.

**Handle --autopilot first:**
- If `--autopilot`:
  1. Check tmux is installed → error with install instructions if not
  2. Derive task slug from `--prd` filename or `--task` first words
  3. Autopilot is not available in OpenCode CLI. Proceed with manual dispatch using the Agent tool.

**Handle --stop and --status first:**
- If `--stop`: Update all `.project/status/` files to mark running tasks as stopped. No persistent team sessions in OpenCode — agents are ephemeral subagent calls.
- If `--status`: Read `.project/status/` files and display them.

**Auto-detect mode if not provided:**
- Has `--project` (with or without other flags) → `ticket`
- Has `--prd` → `team`
- Has `--task` with `+` or `,` separating independent items → `parallel`
- Has `--task` with single focused request → `solo`
- Ambiguous → Ask using AskUserQuestion with options: team, parallel, solo, ticket

### Step 2: Load Agent Registry

1. Read `.opencode/base/settings.json` to get configuration
2. Read `.opencode/agents/agent-registry.json` as the single source of truth
3. Build agent map: `{ agentName: { name, file, stack, tags } }`
4. For `file` paths, resolve from `.opencode/agents/`:
   - Base agent file: `.opencode/agents/{file}`
   - Project agent file: `.opencode/agents/{file}`

### Step 3: Read Mode File

Read the mode's instruction file:

```
.opencode/prompts/team.md (this file)
```

This file contains:
- When to use the mode
- Agent role definitions
- Setup steps
- Execution loop
- Shutdown procedure

### Step 4: Execute Mode

Follow the mode file's instructions, using:
- **Merged agent registry** for agent selection
- **Agent `.md` files** read from registry paths as agent personas
- **Native tools**: Agent (subagent dispatch), SetTodoList (task tracking), Shell (scripts)
- **Templates** from `.opencode/base/templates/` for status files

Key execution patterns by mode:

#### Team Mode
1. Initialize status files from `.opencode/base/templates/`
2. Build backlog from PRD
3. Spawn dev + QA agents via **Agent tool** (with agent `.md` as prompt context)
4. Use **SetTodoList** to track tasks across cycles
5. Run cycle loop: PM specs → Dev builds → QA verifies → repeat

#### Parallel Mode
1. Split task into independent domains
2. Select best agent for each domain from registry
3. Dispatch ALL agents in a **single response** using multiple parallel Agent tool calls with `run_in_background=true`
4. Use TaskList to check progress, review results when all complete, verify no conflicts

#### Solo Mode
1. Parse task for domain signals
2. Select best agent from registry
3. Single Agent tool call with agent persona as prompt context

#### Ticket Mode
1. Read `NOTION_API_KEY` from `backend/.env`
2. Find project page ID via Notion Projects DB (if `--project` provided)
3. Initialize `TICKET_STATUS.md` in `.project/status/ticket-{slug}/`
4. Fetch "New" tickets → Dev Backlog, "Ready for test" → QA Queue
5. Spawn Dev + QA agents via Agent tool with inline Notion API commands
6. Use SetTodoList to track ticket queue state
7. Run cycle: PM specs → Dev fixes (+ Notion sync) → QA verifies → repeat
8. QA also processes pre-existing "Ready for test" tickets in parallel

### Step 5: Status Tracking & Cleanup

- **Team mode**: Track in `.project/status/{slug}/TEAM_STATUS.md` + `CYCLE_LOG.md`
- **Ticket mode**: Track in `.project/status/ticket-{slug}/TICKET_STATUS.md` + `CYCLE_LOG.md`
- **Parallel/Solo**: No persistent status (one-shot execution)
- On completion or stop: shut down agents, update status, clean up team

---

## Agent Override

Use `--agents` to override automatic agent selection:

```bash
# Force specific agents
/team solo --task "fix the bug" --agents ticket-fixer

# Force team composition
/team team --prd ./project/prd/my-prd.md --agents "backend-developer,design-qa-agent"
```

---

## Model Routing

OpenCode CLI uses the model configured in the current session. All subagent dispatches inherit the parent session's model. For cost optimization, use `run_in_background=true` for parallel agents and keep agent prompts compact.

**Token budget guidelines:**
| Phase | Target Prompt Size |
|-------|-------------------|
| Simple review | ≤ 2,000 tokens |
| Standard implementation | ≤ 4,000 tokens |
| Complex multi-file feature | ≤ 6,000 tokens |

Keep prompts small by:
- Referencing guide files by path instead of pasting their contents
- Using compact PHASE_RESULT (≤ 500 tokens)
- Using `artifact_paths` to store detailed output externally
