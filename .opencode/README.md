---
name: opencode-workspace
description: Project-specific AI workflow system for OpenCode agents.
---

# .opencode Workflow

A project-specific workflow system for OpenCode agents, modeled after `.kimi` and optimized for OpenCode's capabilities.

## Directory Structure

```
.opencode/
├── README.md                    # This file
├── base/                        # Base configuration
│   ├── README.md
│   ├── settings.json            # Workspace settings
│   ├── docs/                    # Framework docs, checklists, guides
│   ├── schemas/                 # JSON schemas
│   └── guides/                  # Base guides (OAuth, PM2, etc.)
├── agents/                      # Shared agents (20 agents)
│   ├── agent-registry.json      # Agent registry
│   ├── development/             # Backend, frontend, mobile, API, DB agents
│   ├── analysis/                # Code review, gap analysis, architecture
│   ├── quality/                 # Quality assurance agents
│   ├── operations/              # DevOps and security agents
│   ├── documentation/           # Doc generation agents
│   └── orchestration/           # Project coordinator
├── backend/                     # NestJS-specific workspace
│   ├── README.md
│   ├── agents/
│   │   ├── development/         # Backend developer, module scaffolder
│   │   ├── debugging/           # Auth route debugger
│   │   ├── testing/             # Auth route tester
│   │   └── optimization/        # Cache manager
│   ├── examples/
│   │   └── crud-module/         # Complete CRUD module example
│   └── guides/                  # Backend development guides (25+)
├── frontend/                    # React-specific workspace
│   ├── README.md
│   ├── agents/
│   │   ├── development/         # Frontend developer, error fixer
│   │   └── design-qa/           # Design QA agent
│   ├── docs/
│   │   └── AUTHENTICATION.md    # Frontend auth patterns
│   ├── examples/
│   │   └── complete-examples.md
│   └── guides/                  # Frontend development guides (14+)
├── mobile/                      # React Native-specific workspace
│   ├── README.md
│   ├── agents/
│   │   ├── development/         # Mobile developer, error fixer
│   │   ├── frontend-developer.md
│   │   └── frontend-error-fixer.md
│   ├── docs/
│   │   ├── AUTHENTICATION.md    # Mobile auth patterns
│   │   └── BEST_PRACTICES.md    # Mobile best practices
│   ├── examples/
│   │   └── complete-examples.md
│   └── guides/                  # Mobile development guides (12+)
├── skills/                      # Project-level skills (21+ skills)
│   ├── commit/                  # Git commit & PR workflow
│   ├── create-dev-pr/           # Create PR to dev branch
│   ├── find-gaps/               # Design-to-code gap analysis
│   ├── fix-gaps/                # Fix identified gaps
│   ├── generate-docs/           # Generate API & knowledge docs
│   ├── review-tickets/          # Notion ticket review
│   ├── run-fullstack/           # Full-stack development pipeline
│   ├── crud-module-generator/   # Generate NestJS CRUD modules
│   ├── e2e-test-generator/      # Generate E2E tests
│   ├── swagger-doc-generator/   # Generate Swagger docs
│   ├── code-quality-checker/    # Check code quality
│   ├── guard-decorator-builder/ # Build NestJS guards
│   ├── response-dto-factory/    # Generate response DTOs
│   ├── run-playwright/          # Run Playwright E2E tests
│   ├── generate-prd/            # Generate PRD from input
│   ├── generate-ppt/            # Generate HTML presentations
│   ├── generate-proposal/       # Generate client proposals
│   ├── generate-invoice/        # Generate invoices
│   ├── reflect/                 # Session reflection
│   └── skill-rules.json         # Skill activation rules
├── prompts/                     # Reusable prompt templates (70+)
│   ├── commit.md
│   ├── debug.md
│   ├── deploy.md
│   ├── design-qa.md
│   ├── feature-spec.md
│   ├── fix-gaps.md
│   ├── fullstack.md
│   ├── gap-finder.md
│   ├── generate-crud.md
│   ├── generate-prd.md
│   ├── html-to-react.md
│   ├── new-project.md
│   ├── qa.md
│   ├── reflect.md
│   ├── refactor.md
│   ├── run-e2e.md
│   ├── setup-opencode.md
│   ├── start.md
│   ├── team.md
│   ├── ui-review.md
│   └── ... and 50+ more
├── guides/                      # Quick-reference guides
│   ├── WORKFLOW-GUIDE.md
│   ├── BACKEND-PATTERNS.md
│   └── FRONTEND-PATTERNS.md
└── examples/                    # Example outputs
    └── README.md
```

## How It Works

### Skills

Skills are loaded by OpenCode and invoked with `/skill:<name>`:

| Skill | Command | Purpose |
|-------|---------|---------|
| `commit` | `/skill:commit` | Git commit & PR workflow |
| `create-dev-pr` | `/skill:create-dev-pr` | Create PR to dev with validation |
| `find-gaps` | `/skill:find-gaps` | Design-to-code gap analysis |
| `fix-gaps` | `/skill:fix-gaps` | Fix identified gaps |
| `generate-docs` | `/skill:generate-docs` | Generate API & knowledge docs |
| `review-tickets` | `/skill:review-tickets` | Review Notion tickets |
| `run-fullstack` | `/skill:run-fullstack` | Full-stack dev pipeline |
| `crud-module-generator` | `/skill:crud-module-generator` | Generate NestJS CRUD |
| `e2e-test-generator` | `/skill:e2e-test-generator` | Generate E2E tests |
| `swagger-doc-generator` | `/skill:swagger-doc-generator` | Generate Swagger docs |
| `code-quality-checker` | `/skill:code-quality-checker` | Check code quality |
| `guard-decorator-builder` | `/skill:guard-decorator-builder` | Build NestJS guards |
| `response-dto-factory` | `/skill:response-dto-factory` | Generate response DTOs |
| `run-playwright` | `/skill:run-playwright` | Run Playwright tests |
| `generate-prd` | `/skill:generate-prd` | Generate PRD from input |
| `generate-ppt` | `/skill:generate-ppt` | Generate HTML presentations |
| `generate-proposal` | `/skill:generate-proposal` | Generate client proposals |
| `generate-invoice` | `/skill:generate-invoice` | Generate invoices |
| `reflect` | `/skill:reflect` | Session reflection |

### Agents

Agents are specialized roles for complex tasks. Register them in `agents/agent-registry.json`:

**Development Agents (6):**
- `backend-developer` — NestJS specialist (`agents/development/backend-developer.md`)
- `frontend-developer` — React specialist (`agents/development/frontend-developer.md`)
- `mobile-developer` — React Native specialist (`agents/development/mobile-developer.md`)
- `database-designer` — Database schema designer (`agents/development/database-designer.md`)
- `api-integration-developer` — API integration specialist (`agents/development/api-integration-developer.md`)
- `fullstack-developer` — Full-stack coordinator (`agents/development/fullstack-developer.md`)

**Analysis Agents (5):**
- `gap-analyzer` — Gap analysis specialist (`agents/analysis/gap-analyzer.md`)
- `code-reviewer` — Code review specialist (`agents/analysis/code-reviewer.md`)
- `plan-reviewer` — Review plans (`agents/analysis/plan-reviewer.md`)
- `automation-scout` — Detect automation opportunities (`agents/analysis/automation-scout.md`)
- `learning-extractor` — Extract learnings (`agents/analysis/learning-extractor.md`)

**Quality Agents (3):**
- `refactorer` — Refactoring execution (`agents/quality/refactorer.md`)
- `error-resolver` — Fix errors (`agents/quality/error-resolver.md`)
- `test-engineer` — Testing specialist (`agents/quality/test-engineer.md`)

**Operations Agents (2):**
- `devops-agent` — DevOps specialist (`agents/operations/devops-agent.md`)
- `security-reviewer` — Security audit (`agents/operations/security-reviewer.md`)

**Documentation Agents (3):**
- `documentation-architect` — Doc architecture (`agents/documentation/documentation-architect.md`)
- `prd-converter` — PRD to spec (`agents/documentation/prd-converter.md`)
- `web-research-specialist` — Technical research (`agents/documentation/web-research-specialist.md`)

**Orchestration (1):**
- `project-coordinator` — Multi-agent orchestration (`agents/orchestration/project-coordinator.md`)

### Prompts

Reusable prompt templates for common tasks (70+ prompts):
- `commit` — Git commit workflow
- `debug` — Systematic debugging
- `deploy` — Deployment workflow
- `design-qa` — Design quality assurance
- `feature-spec` — Feature implementation from spec
- `fix-gaps` — Fix implementation gaps
- `fullstack` — Full-stack development
- `gap-finder` — Find gaps
- `generate-crud` — Generate CRUD
- `generate-prd` — Generate PRD
- `html-to-react` — Convert HTML to React
- `new-project` — New project setup
- `qa` — Quality assurance
- `reflect` — Session reflection
- `refactor` — Safe refactoring
- `run-e2e` — Run E2E tests
- `setup-OpenCode` — Setup OpenCode config
- `start` — Project startup
- `team` — Team coordination
- `ui-review` — UI review
- ... and 50+ more in `prompts/`

## Usage Examples

```
/skill:commit
/skill:find-gaps
/skill:generate-docs
/skill:run-fullstack
Run the backend-developer to implement this API
Run the project-coordinator to plan this feature
Run the test-engineer to validate this flow
Use the debug prompt
```

## Creating New Skills

1. Create folder: `skills/{skill-name}/`
2. Add `SKILL.md` with frontmatter:
   ```markdown
   ---
   name: skill-name
   description: What this skill does and when to use it
   ---
   ```
3. Register in `skills/skill-rules.json`
4. Invoke with `/skill:skill-name`

## Creating New Agents

1. Create file: `agents/{category}/{agent-name}.md`
2. Add frontmatter with role and tags
3. Register in `agents/agent-registry.json`
4. Invoke with: "Run the {agent-name} to..."

## Integration with .project

All frameworks (`.opencode`, `.kimi`) share `.project/`:
- `.project/docs/` — Technical docs
- `.project/memory/` — Decisions, learnings
- `.project/status/` — Implementation status
- `.project/prd/` — Product requirements

**Rule**: Always update `.project/memory/DECISIONS.md` when making architectural choices, and `.project/memory/LEARNINGS.md` when discovering reusable patterns.

## Cross-Framework Conventions

| Action | OpenCode | Kimi |
|--------|----------|------|
| Create full project | `/new-project` | `/new-project` |
| Init docs only | `/init-workspace` | `/init-workspace` |
| Init session harness | `/init-harness` | `/init-harness` |
| Run fullstack loop | `/skill:run-fullstack` | `/skill:run-fullstack` |
| Commit & PR | `/skill:commit` | `/skill:commit` |
| Find gaps | `/skill:find-gaps` | `/skill:find-gaps` |
| Fix gaps | `/skill:fix-gaps` | `/skill:fix-gaps` |
| Generate docs | `/skill:generate-docs` | `/skill:generate-docs` |
